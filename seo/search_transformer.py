import re
import itertools
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# This is a basic compiler which transforms input search queries and
# some context into queries ready for Solr.
#
# The compiler consists of:
#
# * A peekable token stream mechanism.
#
# * Tokenizer
#       A Python generator that is responsible only for breaking the
#       input into individual tokens.
#
# * Recursive descent parser
#       A basic recursive descent parser that gets the input operator
#       precendence right.
#
#       Includes a defensive mechanism to keep malicious input from
#       causing the parser to give up after too many steps.
#
# * Optimizer
#       Handles special cases.
#
# MAINTENANCE ADVICE:
#
# Something complex like this can grow unmaintainable even with the
# unit test battery.
#
# * Make changes as close to the output as possible.
#
# * [BAD] Changes to the tokenizer affect everything downstream.
#       It is tempting, since there are regex's here, to just tweak
#       those. Little changes here can have hard to predict ripple
#       effects. The tokenizer needs to be as simple as we can get
#       away with.
#
# * [BAD] The parser's behavior is surprisingly senstive to tiny
#       changes. Smaller is better her. Only change this if
#       there is no other way.
#
# * [GOOD] Changes/additions to the optimizer patterns affect only
#       other optimizer patterns. This is where we try to do as much
#       work as we can.


# Token Stream --------------------------------

# For a recursive descent parser we need a stream of tokens where we
# can peek ahead in the element stream without consuming the element.
#
# http://stackoverflow.com/questions/2425270/how-to-look-ahead-one-element-in-a-python-generator
class Peekable(object):
    """Wrap a generator so that we can peek at the first element.

    Instead of requiring the user to handle StopIteration, return
    a last element instead.

    The last element is only returned by next. Iterating with for
    will behave the usual python way.

    This arrangement seems to be the most convenient for implementing
    a parser.
    """

    def __init__(self, gen, last):
        self.gen, = itertools.tee(gen, 1)
        self.last = last

    def __iter__(self):
        return self.gen

    def next(self):
        try:
            return iter(self).next()
        except StopIteration:
            return self.last

    def peek(self):
        try:
            return self.gen.__copy__().next()
        except StopIteration:
            return self.last


def peekable(last):
    """Decorator for generators whose elements need to be peekable."""

    def make_peekable(fn):
        @wraps(fn)
        def peekable_fn(*args):
            return Peekable(fn(*args), last)
        return peekable_fn
    return make_peekable

# Tokenizer -------------------------------

AND_OPS = {"and", "&", "-"}
OR_OPS = {"or", ",", "|"}
NOT_OPS = {"not", "!"}


class Token(object):
    """Represents a token found by the tokenizer."""

    def __init__(self, token_type, token, flags=None):
        if flags is None: flags = []
        self.token_type = token_type
        self.token = token
        self.flags = flags

    def is_or(self):
        return self.token_type == 'op' and self.token in OR_OPS

    def is_and(self):
        return self.token_type == 'op' and self.token in AND_OPS

    def is_not(self):
        return (self.token_type == 'pdash' or
                self.token_type == 'op' and self.token in NOT_OPS)

    def is_term(self):
        return self.token_type == 'term'

    def is_andable(self):
        return (self.is_and() or
                self.is_not() or
                self.is_term())

    def is_eof(self):
        return self.token_type == 'eof'

    def is_quote(self):
        return self.token_type == 'quote'

    def is_openparen(self):
        return self.token_type == 'openp'

    def is_closeparen(self):
        return self.token_type == 'closep'

    def __repr__(self):
        return "<Token %s %s: %s>" % (self.token_type, tuple(self.flags),
                                      self.token)


def regex_format_op(op):
    if op[0].isalpha():
        return re.escape(op) + r'\b'
    else:
        return re.escape(op)


def build_op_regex(ops):
    ops_pattern = ("(%s)(.*)" %
                   '|'.join(regex_format_op(op) for op in ops))
    return re.compile(ops_pattern, re.I)

infix_ops_re = build_op_regex(AND_OPS | OR_OPS)
# dash is not a proper prefix op. No following space allowed.
dash_re = re.compile(r'(-)(\S.*)')
prefix_ops_re = build_op_regex(NOT_OPS)
ws_re = re.compile(r'\s+(.*)')
quoted_phrase_re = re.compile(r'\"\s*(.*?)\s*\"(.*)')
plus_re = re.compile(r'(\+\S*)(.*)')

# These characters are considered part of a term and can
# start a term. Does not include - which can only appear in
# the middle of a term.
term_punctuation = "#$%&*.:;<>=?@[]^_`{}~"
term_punctuation_pattern = "|".join([re.escape(c)
                                     for c in term_punctuation])

# Need to include dashes as part of search terms.
# Also want to include : and ^ just in case those need
# passed through to solr as well.
# Also include other non operator symbols. ex: c#, c$
raw_term_pattern = (r'(?:\\.|\w|%(punc)s)(?:\\.|\w|%(punc)s|-)*' %
                    {'punc': term_punctuation_pattern})
term_re = re.compile(r'(%s)(.*)' % raw_term_pattern, re.U)

token_peekable = peekable(Token('eof', ''))


@token_peekable
def tokenize(input_query):
    current = input_query
    while(current != ''):
        # eat whitespace
        ws_match = ws_re.match(current)
        if ws_match:
            current = ws_match.group(1)
            continue

        # try to match an open paren
        if current[0] == '(':
            # If there is no possible matching paren, it's a term
            if ')' in input_query:
                yield Token('openp', '(')
            else:
                yield Token('term', '(')
            current = current[1:]
            continue

        # try to match a close paren
        if current[0] == ')':
            # If there is no possible matching paren, it's a term
            if '(' in input_query:
                yield Token('closep', ')')
            else:
                yield Token('term', ')')
            current = current[1:]
            continue

        # try to match a quoted phrase
        match = quoted_phrase_re.match(current)
        if match:
            current = match.group(2)
            yield Token('term', match.group(1), ['quote'])
            continue

        # try to match prefix - special behavior
        match = dash_re.match(current)
        if match:
            current = match.group(2)
            yield Token('pdash', match.group(1))
            continue

        # try to match an infix operator
        match = infix_ops_re.match(current)
        if match:
            current = match.group(2)
            yield Token('op', match.group(1).lower())
            continue

        # try to match a prefix operator
        match = prefix_ops_re.match(current)
        if match:
            current = match.group(2)
            yield Token('op', match.group(1).lower())
            continue

        # try to match unary + special behavior
        match = plus_re.match(current)
        if match:
            current = match.group(2)
            yield Token('term', match.group(1).lower())
            continue

        # try to match a term
        match = term_re.match(current)
        if match:
            current = match.group(2)
            yield Token('term', match.group(1))
            continue

        # pass it through as a single character term
        yield Token('term', current[0])
        current = current[1:]


# Parser --------------------------------------

class AstTree(object):
    """The result of both parsing and optimizing.

    This object has a type, children, and flags.

    It is primarily responsible for representing value and serization.
    """

    def __init__(self, node_type, head=None, tail=None, flags=None, children=None):
        if tail is None: tail = []
        if flags is None: flags = []

        self.node_type = node_type
        if children is not None:
            self.children = children
        else:
            self.children = [head] + tail
        self.flags = flags

    def string(self):
        if self.node_type == 'or':
            return "%s" % " OR ".join(self.child_strings())
        elif self.node_type == 'and':
            return " AND ".join(self.child_strings())
        elif self.node_type == 'not':
            return "NOT %s" % self.head_string()
        elif self.node_type == 'term':
            if "quote" in self.flags:
                return '"%s"' % self.head_string()
            else:
                return self.head_string()
        elif self.node_type == 'paren':
            return "(%s)" % self.head_string()

    def child_strings(self):
        return (c.string() for c in self.children)

    def head_string(self):
        head = self.children[0]
        if (isinstance(head, AstTree)):
            return head.string()
        else:
            return head

    def __repr__(self):
        return "<AstTree %s %s: %s>" % (self.node_type,
                                        tuple(self.flags),
                                        self.children)


class Energy(object):
    def __init__(self, starting_energy):
        self.starting_energy = starting_energy
        self.energy = starting_energy

    def step(self):
        self.energy -= 1
        if self.energy <= 0:
            message = ("Too many parsing steps: %d."
                       % self.starting_energy)
            raise ValueError(message)


class Parser(object):
    def __init__(self, token_stream, stepper):
        self.token_stream = token_stream
        self.stepper = stepper

    def parse(self):
        """Process tokens, and produce an AST."""
        return self.handle_and()

    def handle_and(self):
        self.stepper.step()
        first = self.handle_or()
        additional = []
        while self.token_stream.peek().is_andable():
            while self.token_stream.peek().is_and():
                self.token_stream.next()
            if self.token_stream.peek().is_eof():
                break
            additional.append(self.handle_or())
        if len(additional) > 0:
            return AstTree('and', first, additional)
        else:
            return first

    def handle_or(self):
        self.stepper.step()
        first = self.handle_not()
        additional = []
        while self.token_stream.peek().is_or():
            while self.token_stream.peek().is_or():
                self.token_stream.next()
            if self.token_stream.peek().is_eof():
                break
            additional.append(self.handle_not())
        if len(additional) > 0:
            return AstTree('paren', AstTree('or', first, additional))
        else:
            return first

    def handle_not(self):
        self.stepper.step()
        has_not_op = False
        if self.token_stream.peek().is_not():
            self.token_stream.next()
            has_not_op = True
        term = self.handle_paren()
        if has_not_op:
            return AstTree('not', term)
        else:
            return term

    def handle_paren(self):
        self.stepper.step()
        found_open = False
        found_close = False

        if self.token_stream.peek().is_openparen():
            self.token_stream.next()
            found_open = True

        if found_open:
            term = self.handle_and()
        else:
            term = self.handle_term()

        if found_open and self.token_stream.peek().is_closeparen():
            self.token_stream.next()
            found_close = True

        if found_open and found_close:
            return AstTree('paren', term)
        else:
            return term

    def handle_term(self):
        self.stepper.step()
        # Eat any garbage
        while self.token_stream.peek().token_type not in ('term', 'eof'):
            token = self.token_stream.next()
        token = self.token_stream.next()
        return AstTree('term', token.token, flags=token.flags)


# Optimizer ----------------------------------

# optimize_tree coordinates the work.
#
# The actual work is done by the optimization functions.
#
# Each function receives a reference to the tree node which is being
# optimized and a reference to the root node of the entire tree. A few
# patterns need that root reference.
#
# The function is responsible for inspecting the node to determine if
# it should do anything with the node.
#
# The function, if it determines it should modify the node, should do so,
# and return None.
#
# If the function needs to replace the current node altogether, it should
# return a new node. The caller is responsible for doing the replacement.
#
# To add new patterns, write a new optimization function and add a
# reference to it in optimize_tree.


bare_term_re = re.compile(r'\A%s\Z' % raw_term_pattern, re.U)


def remove_simple_term_quotes(tree, root):
    if (tree.node_type == 'term' and
            'quote' in tree.flags and
            bare_term_re.match(tree.children[0])):
        tree.flags.remove('quote')


def drop_standalone_dash(tree, root):
    if (tree.node_type == 'and' and
            len(tree.children) == 2 and
            isinstance(tree.children[0], AstTree) and
            isinstance(tree.children[1], AstTree) and
            tree.children[0].node_type == 'term' and
            tree.children[0].children[0] == '-' and
            tree.children[1].node_type == 'term'):
        children = [" ".join(child.children[0]
                    for child in tree.children[1:])]

        new_children = [" ".join(child.children[0]
                        for child in tree.children[1:])]
        return AstTree('term', children=new_children)


def escape_standalone_slash(tree, root):
    if (tree.node_type == 'term' and
            tree.children[0] == '/'):
        tree.children[0] = '\\/'


def prepend_term_prefix(tree, root):
    if (tree.node_type == 'and' and
            len(tree.children) > 1 and
            tree.children[0].node_type == 'term' and
            tree.children[1].node_type == 'term' and
            tree.children[1].flags == [] and
            tree.children[0].children[0] in ['(', '"', '*', '?']):
        new_children = [
            AstTree('term', "%s%s" %
                    (tree.children[0].children[0],
                     tree.children[1].children[0]))]
        new_children.extend(tree.children[2:])
        return AstTree('and', children=new_children)


def append_term_suffix(tree, root):
    if (tree.node_type == 'and' and
            len(tree.children) > 1 and
            tree.children[-2].node_type == 'term' and
            tree.children[-1].node_type == 'term' and
            tree.children[-2].flags == [] and
            tree.children[-1].children[0] in ['"', '*', '?', ')']):
        new_children = tree.children[:-2]
        new_children.append(
            AstTree('term', "%s%s" % (
                     tree.children[-2].children[0],
                     tree.children[-1].children[0])))
        return AstTree('and', children=new_children)


def remove_redundant_parens(tree, root):
    if (tree.node_type == 'paren' and
            len(tree.children) == 1 and
            isinstance(tree.children[0], AstTree) and
            tree.children[0].node_type == 'paren'):
        tree.children = tree.children[0].children


def escape_prefix_symbol(tree, root):
    if (tree.node_type == 'term' and
            len(tree.children[0]) > 0 and
            tree.children[0][0] != '+' and
            tree.children[0][0] in ['*', '(']):
        tree.children[0] = '\\%s' % tree.children[0]


def escape_suffix_symbol(tree, root):
    if (tree.node_type == 'term' and
            len(tree.children[0]) > 0 and
            tree.children[0][0] != '+' and
            tree.children[0][-1] in [')']):
        original = tree.children[0]
        edited = '%s\\%s' % (original[:-1], original[-1])
        tree.children[0] = edited


def escape_plus_term(tree, root):
    if (tree.node_type == 'term' and
            len(tree.children[0]) > 0 and
            tree.children[0][0] == '+'):
        result = tree.children[0]
        single_chars_regex = '([%s])' % re.escape('+-!(){}[]^~*?:')
        result = re.sub(single_chars_regex, r'\\\1', result)
        result = re.sub(r'(&+|\|+)', r'\\\1', result)
        tree.children[0] = result


def optimize_tree(tree, root):
    optimizations = [
        remove_simple_term_quotes,
        remove_redundant_parens,
        drop_standalone_dash,
        escape_standalone_slash,
        prepend_term_prefix,
        append_term_suffix,
        escape_prefix_symbol,
        escape_suffix_symbol,
        escape_plus_term,
    ]

    for optimization in optimizations:
        new_tree = optimization(tree, root)
        if new_tree is not None:
            tree = new_tree

    for i, child in enumerate(tree.children):
        if isinstance(child, AstTree):
            new_child = optimize_tree(child, root)
            if new_child is not None:
                tree.children[i] = new_child

    return tree


# Entry Point -------------------------------------

class SearchTransformer(object):
    def __init__(self, tokenize, parser, optimize, stepper_factory):
        self.tokenize = tokenize
        self.parser = parser
        self.optimize = optimize
        self.stepper_factory = stepper_factory

    def transform(self, input_query):
        try:
            # Tokenize
            token_stream = self.tokenize(input_query)

            # Parse
            stepper = self.stepper_factory()
            parser = self.parser(token_stream, stepper)
            tree = parser.parse()

            # Optimize
            optimized_tree = self.optimize(tree, tree)

            # Serialize
            query = optimized_tree.string()

            return query
        except Exception as e:
            logging.warn("Could not handle search '%s': %s" %
                         (input_query, e.message))
            return input_query


def transform_search(input_query):
    """Create a query ready for sending to Solr."""
    def build_stepper():
        return Energy(5000)

    compiler = SearchTransformer(tokenize, Parser, optimize_tree,
                                 build_stepper)
    return compiler.transform(input_query)
