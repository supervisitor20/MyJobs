import re, sys
import ipdb

from search_transformer import peekable
from mypartners.models import Location

address_line_1_terms = ['alley',
                        'alley',
                        'ally',
                        'aly',
                        'anex',
                        'annex',
                        'annx',
                        'anx',
                        'arcade',
                        'arcade',
                        'avenue',
                        'ave',
                        'aven',
                        'avenu',
                        'avenue',
                        'avn',
                        'avnue',
                        'bayou',
                        'bayou',
                        'beach',
                        'beach',
                        'bend',
                        'bnd',
                        'bluff',
                        'bluf',
                        'bluff',
                        'bluffs',
                        'bottom',
                        'btm',
                        'bottm',
                        'bottom',
                        'boulevard',
                        'boul',
                        'boulevard',
                        'boulv',
                        'branch',
                        'brnch',
                        'branch',
                        'bridge',
                        'brg',
                        'bridge',
                        'brook',
                        'brook',
                        'brooks',
                        'burg',
                        'burgs',
                        'bypass',
                        'bypa',
                        'bypas',
                        'bypass',
                        'byps',
                        'camp',
                        'cp',
                        'cmp',
                        'canyon',
                        'canyon',
                        'cnyn',
                        'cape',
                        'cpe',
                        'causeway',
                        'causwa',
                        'cswy',
                        'center',
                        'cent',
                        'center',
                        'centr',
                        'centre',
                        'cnter',
                        'cntr',
                        'ctr',
                        'centers',
                        'circle',
                        'circ',
                        'circl',
                        'circle',
                        'crcl',
                        'crcle',
                        'circles',
                        'cliff',
                        'cliff',
                        'cliffs',
                        'cliffs',
                        'club',
                        'club',
                        'common',
                        'commons',
                        'corner',
                        'corner',
                        'corners',
                        'cors',
                        'course',
                        'crse',
                        'court',
                        'ct',
                        'courts',
                        'cts',
                        'cove',
                        'cv',
                        'coves',
                        'creek',
                        'crk',
                        'crescent',
                        'cres',
                        'crsent',
                        'crsnt',
                        'crest',
                        'crossing',
                        'crssng',
                        'xing',
                        'crossroad',
                        'crossroads',
                        'curve',
                        'dale',
                        'dl',
                        'dam',
                        'dm',
                        'divide',
                        'divide',
                        'dv',
                        'dvd',
                        'drive',
                        'driv',
                        'drive',
                        'drv',
                        'drives',
                        'estate',
                        'estate',
                        'estates',
                        'ests',
                        'expressway',
                        'expr',
                        'express',
                        'expressway',
                        'expw',
                        'expy',
                        'extension',
                        'extension',
                        'extn',
                        'extnsn',
                        'extensions',
                        'fall',
                        'falls',
                        'fls',
                        'ferry',
                        'frry',
                        'fry',
                        'field',
                        'fld',
                        'fields',
                        'flds',
                        'flat',
                        'flt',
                        'flats',
                        'flts',
                        'ford',
                        'frd',
                        'fords',
                        'forest',
                        'forests',
                        'frst',
                        'forge',
                        'forge',
                        'frg',
                        'forges',
                        'fork',
                        'frk',
                        'forks',
                        'frks',
                        'fort',
                        'frt',
                        'ft',
                        'freeway',
                        'freewy',
                        'frway',
                        'frwy',
                        'fwy',
                        'garden',
                        'gardn',
                        'grden',
                        'grdn',
                        'gardens',
                        'gdns',
                        'grdns',
                        'gateway',
                        'gatewy',
                        'gatway',
                        'gtway',
                        'gtwy',
                        'glen',
                        'gln',
                        'glens',
                        'green',
                        'grn',
                        'greens',
                        'grove',
                        'grove',
                        'grv',
                        'groves',
                        'harbor',
                        'harbor',
                        'harbr',
                        'hbr',
                        'hrbor',
                        'harbors',
                        'haven',
                        'hvn',
                        'heights',
                        'hts',
                        'highway',
                        'highwy',
                        'hiway',
                        'hiwy',
                        'hway',
                        'hwy',
                        'hill',
                        'hl',
                        'hills',
                        'hls',
                        'hollow',
                        'hollow',
                        'hollows',
                        'holw',
                        'holws',
                        'inlet',
                        'island',
                        'island',
                        'islnd',
                        'islands',
                        'islnds',
                        'iss',
                        'isle',
                        'isles',
                        'junction',
                        'jction',
                        'jctn',
                        'junction',
                        'junctn',
                        'juncton',
                        'junctions',
                        'jcts',
                        'junctions',
                        'key',
                        'ky',
                        'keys',
                        'kys',
                        'knoll',
                        'knol',
                        'knoll',
                        'knolls',
                        'knolls',
                        'lake',
                        'lake',
                        'lakes',
                        'lakes',
                        'land',
                        'landing',
                        'lndg',
                        'lndng',
                        'lane',
                        'ln',
                        'light',
                        'light',
                        'lights',
                        'loaf',
                        'loaf',
                        'lock',
                        'lock',
                        'locks',
                        'locks',
                        'lodge',
                        'ldge',
                        'lodg',
                        'lodge',
                        'loop',
                        'loops',
                        'mall',
                        'manor',
                        'manor',
                        'manors',
                        'mnrs',
                        'meadow',
                        'meadows',
                        'mdws',
                        'meadows',
                        'medows',
                        'mews',
                        'mill',
                        'mills',
                        'mission',
                        'mssn',
                        'motorway',
                        'mount',
                        'mt',
                        'mount',
                        'mountain',
                        'mntn',
                        'mountain',
                        'mountin',
                        'mtin',
                        'mtn',
                        'mountains',
                        'mountains',
                        'neck',
                        'neck',
                        'orchard',
                        'orchard',
                        'orchrd',
                        'oval',
                        'ovl',
                        'overpass',
                        'park',
                        'prk',
                        'parks',
                        'parkway',
                        'parkwy',
                        'pkway',
                        'pkwy',
                        'pky',
                        'parkways',
                        'pkwys',
                        'pass',
                        'passage',
                        'path',
                        'paths',
                        'pike',
                        'pikes',
                        'pine',
                        'pines',
                        'pnes',
                        'place',
                        'plain',
                        'pln',
                        'plains',
                        'plns',
                        'plaza',
                        'plz',
                        'plza',
                        'point',
                        'pt',
                        'points',
                        'pts',
                        'port',
                        'prt',
                        'ports',
                        'prts',
                        'prairie',
                        'prairie',
                        'prr',
                        'radial',
                        'radial',
                        'radiel',
                        'radl',
                        'ramp',
                        'ranch',
                        'ranches',
                        'rnch',
                        'rnchs',
                        'rapid',
                        'rpd',
                        'rapids',
                        'rpds',
                        'rest',
                        'rst',
                        'ridge',
                        'rdge',
                        'ridge',
                        'ridges',
                        'ridges',
                        'river',
                        'river',
                        'rvr',
                        'rivr',
                        'road',
                        'road',
                        'roads',
                        'rds',
                        'route',
                        'row',
                        'rue',
                        'run',
                        'shoal',
                        'shoal',
                        'shoals',
                        'shoals',
                        'shore',
                        'shore',
                        'shr',
                        'shores',
                        'shores',
                        'shrs',
                        'skyway',
                        'spring',
                        'spng',
                        'spring',
                        'sprng',
                        'springs',
                        'spngs',
                        'springs',
                        'sprngs',
                        'spur',
                        'spurs',
                        'square',
                        'sqr',
                        'sqre',
                        'squ',
                        'square',
                        'squares',
                        'squares',
                        'station',
                        'station',
                        'statn',
                        'stn',
                        'stravenue',
                        'strav',
                        'straven',
                        'stravenue',
                        'stravn',
                        'strvn',
                        'strvnue',
                        'stream',
                        'streme',
                        'strm',
                        'street',
                        'strt',
                        'st',
                        'str',
                        'streets',
                        'summit',
                        'sumit',
                        'sumitt',
                        'summit',
                        'terrace',
                        'terr',
                        'terrace',
                        'throughway',
                        'trace',
                        'traces',
                        'trce',
                        'track',
                        'tracks',
                        'trak',
                        'trk',
                        'trks',
                        'trafficway',
                        'trail',
                        'trails',
                        'trl',
                        'trls',
                        'trailer',
                        'trlr',
                        'trlrs',
                        'tunnel',
                        'tunl',
                        'tunls',
                        'tunnel',
                        'tunnels',
                        'tunnl',
                        'turnpike',
                        'turnpike',
                        'turnpk',
                        'underpass',
                        'union',
                        'union',
                        'unions',
                        'valley',
                        'vally',
                        'vlly',
                        'vly',
                        'valleys',
                        'vlys',
                        'viaduct',
                        'via',
                        'viadct',
                        'viaduct',
                        'view',
                        'vw',
                        'views',
                        'vws',
                        'village',
                        'villag',
                        'village',
                        'villg',
                        'villiage',
                        'vlg',
                        'villages',
                        'vlgs',
                        'ville',
                        'vl',
                        'vista',
                        'vist',
                        'vista',
                        'vst',
                        'vsta',
                        'walk',
                        'walks',
                        'wall',
                        'way',
                        'way',
                        'ways',
                        'well',
                        'wells',
                        'wls',
                        'allee',
                        'anex',
                        'arc',
                        'av',
                        'bayoo',
                        'bch',
                        'bend',
                        'blf',
                        'bluffs',
                        'blvd',
                        'bot',
                        'br',
                        'brdge',
                        'brk',
                        'brooks',
                        'burg',
                        'burgs',
                        'byp',
                        'camp',
                        'canyn',
                        'cape',
                        'causeway',
                        'cen',
                        'centers',
                        'cir',
                        'circles',
                        'clb',
                        'clf',
                        'clfs',
                        'common',
                        'commons',
                        'cor',
                        'corners',
                        'course',
                        'court',
                        'courts',
                        'cove',
                        'coves',
                        'creek',
                        'crescent',
                        'crest',
                        'crossing',
                        'crossroad',
                        'crossroads',
                        'curve',
                        'dale',
                        'dam',
                        'div',
                        'dr',
                        'drives',
                        'est',
                        'estates',
                        'exp',
                        'ext',
                        'exts',
                        'fall',
                        'falls',
                        'ferry',
                        'field',
                        'fields',
                        'flat',
                        'flats',
                        'ford',
                        'fords',
                        'forest',
                        'forg',
                        'forges',
                        'fork',
                        'forks',
                        'fort',
                        'freeway',
                        'garden',
                        'gardens',
                        'gateway',
                        'glen',
                        'glens',
                        'green',
                        'greens',
                        'grov',
                        'groves',
                        'harb',
                        'harbors',
                        'haven',
                        'highway',
                        'hill',
                        'hills',
                        'hllw',
                        'ht',
                        'inlt',
                        'is',
                        'islands',
                        'isle',
                        'jct',
                        'jctns',
                        'key',
                        'keys',
                        'knl',
                        'knls',
                        'land',
                        'landing',
                        'lane',
                        'lck',
                        'lcks',
                        'ldg',
                        'lf',
                        'lgt',
                        'lights',
                        'lk',
                        'lks',
                        'loop',
                        'mall',
                        'manors',
                        'mdw',
                        'meadow',
                        'mews',
                        'mill',
                        'mills',
                        'missn',
                        'mnr',
                        'mnt',
                        'mntain',
                        'mntns',
                        'motorway',
                        'nck',
                        'orch',
                        'oval',
                        'overpass',
                        'park',
                        'parks',
                        'parkway',
                        'parkways',
                        'pass',
                        'passage',
                        'path',
                        'pike',
                        'pine',
                        'pines',
                        'pl',
                        'plain',
                        'plains',
                        'plaza',
                        'point',
                        'points',
                        'port',
                        'ports',
                        'pr',
                        'rad',
                        'ramp',
                        'ranch',
                        'rapid',
                        'rapids',
                        'rd',
                        'rdg',
                        'rdgs',
                        'rest',
                        'riv',
                        'roads',
                        'route',
                        'row',
                        'rue',
                        'run',
                        'shl',
                        'shls',
                        'shoar',
                        'shoars',
                        'skyway',
                        'smt',
                        'spg',
                        'spgs',
                        'spur',
                        'spurs',
                        'sq',
                        'sqrs',
                        'sta',
                        'stra',
                        'stream',
                        'street',
                        'streets',
                        'ter',
                        'throughway',
                        'trace',
                        'track',
                        'trafficway',
                        'trail',
                        'trailer',
                        'trnpk',
                        'tunel',
                        'un',
                        'underpass',
                        'unions',
                        'valley',
                        'valleys',
                        'vdct',
                        'view',
                        'views',
                        'vill',
                        'villages',
                        'ville',
                        'vis',
                        'walk',
                        'walks',
                        'wall',
                        'ways',
                        'well',
                        'wells',
                        'wy']

address_line_2_terms = ['apartment','apt',
                        'building','bldg',
                        'office','ofc',
                        'room','rm',
                        'suite','ste',
                        'trailer','trlr',
                        'lobby','lbby',
                        'hangar','hngr',
                        'floor','fl',
                        'basement','bsmt']

po_box_terms = ['po','p.o.', 'p o','po','post office box']

direction_terms = ['n',
                   'ne',
                   'nw',
                   's',
                   'se',
                   'sw',
                   'e',
                   'w',
                   'north',
                   'northeast',
                   'northwest',
                   'south',
                   'southeast',
                   'southwest',
                   'east',
                   'west']

ws_re = re.compile("\s+(.*)")
numeric_re = re.compile("(\d+)(.*)")
direction_re = re.compile("\s+(%s)\s+(.*)" % "|".join(direction_terms), re.I)
add_1_re = re.compile("(%s)(?:$|\s)(.*)" % "|".join(address_line_1_terms), re.I)
po_box_re = re.compile("(%s)((?:\s*(?:box|bo|b)(?:$|\s))|\s+)(.*)" % "|".join(po_box_terms), re.I)
add_2_re = re.compile("^((?:(?:%s)(?=\s))|#)(.*)" % "|".join(address_line_2_terms), re.I)
word_re = re.compile("(\S+)(.*)")


class Token(object):
    def __init__(self, token_type, token):
        self.token_type = token_type
        self.token = token

    def is_numeric(self):
        return self.token_type == 'num'

    def is_direction(self):
        return self.token_type == 'dir'

    def is_po_box(self):
        return self.token_type == 'pob'

    def is_add_1(self):
        return self.token_type == 'add1'

    def is_add_2(self):
        return self.token_type == 'add2'

    def is_word(self):
        return self.token_type == 'word'

    def is_eof(self):
        return self.token_type == 'eof'

    def __repr__(self):
        return "<Token %s %s: %s>" % (self.token_type, tuple(self.flags),
                                      self.token)

token_peekable = peekable(Token('eof', ''))

@token_peekable
def tokenize(input_string):
    current = input_string
    while current:
        match = ws_re.match(current)
        if match:
            current = match.group(1)
            continue

        match = numeric_re.match(current)
        if match:
            current = match.group(2)
            yield Token('num', match.group(1))
            continue

        match = direction_re.match(current)
        if match:
            current = match.group(2)
            yield Token('dir', match.group(1))
            continue

        match = po_box_re.match(current)
        if match:
            current = match.group(3)
            yield Token('pob', match.group(1))
            continue

        match = add_2_re.match(current)
        if match:
            current = match.group(2)
            yield Token('add2', match.group(1))
            continue

        match = add_1_re.match(current)
        if match:
            current = match.group(2)
            yield Token('add1', match.group(1))
            continue

        match = word_re.match(current)
        if match:
            current = match.group(2)
            yield Token('word',match.group(1))
            continue

        current = current[1:]
        continue

class ScoreTree(object):
    def __init__(self, node_type, head, tail=None, children=None):
        self.node_type = node_type
        self.head = head
        self.tail = tail
        if children is None:
            self.children = []
        else:
            self.children = children

    def get_score(self):
        
        add1_score = 0
        add2_score = 0
        if self.children:
            for child in self.children:
                add1_score += child.get_score()[0]
                add2_score += child.get_score()[1]

        if self.node_type == 'add1':
            if self.tail:
                non_word_child = False
                for child in self.children:
                    if child.node_type not in ('word','dir'):
                        non_word_child = True
                if not non_word_child:
                    add1_score += 30
            if self.get_child_count() > 4:
                add1_score -= 20

        if self.node_type == 'pob':
            if self.tail:
                add1_score += 20
                add2_score += 10

        if self.node_type == 'add2':
            if self.tail:
                add2_score += 20

        if self.node_type == 'dir':
            add1_score += 5

        return add1_score, add2_score

    def get_child_count(self):
        count = 0
        for child in self.children:
            count += child.get_child_count()

        return count or 1

class Parser(object):
    def __init__(self, token_stream):
        self.token_stream = token_stream

    def parse(self):
        st = self.handle_master()
        return st.get_score()

    def handle_master(self):
        master_tree = ScoreTree('master','master')

        while not self.token_stream.peek().is_eof():
            master_tree.children.append(self.handle_add2())
        return master_tree

    def handle_add2(self):
        if self.token_stream.peek().is_add_2():
            return ScoreTree('add2',self.token_stream.next(), self.token_stream.next(), [])
        else:
            return self.handle_pobox()

    def handle_pobox(self):
        if self.token_stream.peek().is_po_box():
            po_address = None
            po_token = self.token_stream.next()
            if not self.token_stream.peek().is_eof():
                po_address = self.token_stream.next()
            return ScoreTree('pob',po_token, po_address, [])
        else:
            return self.handle_number()

    def handle_number(self):
        
        found_number = False
        addr_children = []

        if self.token_stream.peek().is_numeric():
            self.token_stream.next()
            found_number = True
        
        if found_number:
            while not (self.token_stream.peek().is_eof() or self.token_stream.peek().is_add_1()):
                addr_children.append(self.handle_add2())
        else:
            word = self.handle_word()

        if found_number:
            st = ScoreTree('add1', 'num', None, addr_children)
            if self.token_stream.peek().is_add_1():
                st.tail = self.token_stream.next()
            return st
        else:
            return word

    def handle_word(self):
        if not self.token_stream.peek().is_eof():
            return ScoreTree('word',self.token_stream.next(),None,[])
        else:
            return None

class ScoreTransformer(object):
    def __init__(self, tokenize, parser):
        self.tokenize = tokenize
        self.parser = parser

    def get_total_score(self, input_query):
        # Tokenize
        token_stream = self.tokenize(input_query)

        # Parse
        parser = self.parser(token_stream)
        return parser.parse()

def calculate_score(input_string):
    input_string = re.sub("[.|,]", "", input_string)
    score_transformer = ScoreTransformer(tokenize, Parser)
    return score_transformer.get_total_score(input_string)

def determine_label_is_address():
    count = 0
    output_file = open('output.txt','w')
    for location in Location.objects.all():
        addr1_score, addr2_score = calculate_score(location.label)
        if addr1_score >= 20:
            count += 1
            output_file.write('----------BEFORE----------\n')
            output_file.write('LABEL:     %s \n' % location.label.encode('utf-8'))
            output_file.write('ADDLN1:     %s \n' % location.address_line_one.encode('utf-8'))
            output_file.write('ADDLN2:     %s \n' % location.address_line_two.encode('utf-8'))

            if location.address_line_one:
                if location.address_line_two:
                    output_file.write('####### UNABLE TO FIX THE ABOVE AUTOMATICALLY, MOVING ON #######\n')
                    continue #report not able to be fixed automatically
                else:
                    location.address_line_two = location.address_line_one
            location.address_line_one = location.label

            output_file.write('----------AFTER----------\n')
            output_file.write('LABEL:     %s \n' % location.label.encode('utf-8'))
            output_file.write('ADDLN1:     %s \n' % location.address_line_one.encode('utf-8'))
            output_file.write('ADDLN2:     %s \n' % location.address_line_two.encode('utf-8'))

    output_file.write('Count: %s' % count)

if __name__ == '__main__':
    print calculate_score(sys.argv[1])