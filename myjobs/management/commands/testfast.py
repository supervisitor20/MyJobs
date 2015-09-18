import sys
import logging
from django.core.management.base import BaseCommand
import unittest.main
import unittest.suite
from unittest.loader import TestLoader
import inspect


class NoDjangoTestLoader(object):
    def __init__(self):
        self.loader = TestLoader()

    def discover(self, start_dir, pattern='test*.py', top_level_dir=None):
        suite = self.loader.discover(start_dir, pattern, top_level_dir)
        return self.suite_without_django(suite)

    def loadTestsFromNames(self, names, module=None):
        return self.suite_without_django(
            self.loader.loadTestsFromNames(names, module))

    def suite_without_django(self, suite):
        tests = (t for t in self.iterate_over_suite(suite)
                 if not self.is_django(t))
        return unittest.suite.TestSuite(tests)

    def iterate_over_suite(self, suite):
        for test_like in suite:
            if not isinstance(test_like, unittest.suite.TestSuite):
                yield test_like
            else:
                for test in self.iterate_over_suite(test_like):
                    yield test

    def is_django(self, test):
        return any('django' in c.__module__
                   for c in inspect.getmro(test.__class__))


class Command(BaseCommand):
    help = 'Runs all tests that don\'t need Django framework'

    def handle(self, *args, **options):
        logging.basicConfig(level=logging.INFO)
        argv = sys.argv[1:]  # manage.py cmd -> cmd
        if len(argv) == 1:
            argv.append('discover')
        program = unittest.TestProgram(
            module=None,
            testLoader=NoDjangoTestLoader(),
            argv=argv)
        print list(NoDjangoTestLoader().discover("."))
