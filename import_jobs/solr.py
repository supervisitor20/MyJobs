from django.conf import settings
from seo_pysolr import Solr
from itertools import chain, islice

def add_jobs(jobs, upload_chunk_size=1024):
    """
    Loads a solr-ready json list of jobs into solr.

    inputs:
        :jobs: A list of solr-ready, json-formatted jobs.

    outputs:
        The ids of jobs loaded into solr.
    """
    conn = Solr(settings.HAYSTACK_CONNECTIONS['default']['URL'])

    # Chunk them
    jobs = chunk(jobs, upload_chunk_size)
    job_ids = list()
    for job_group in jobs:
        job_group = list(job_group)
        conn.add(job_group)
        job_ids.extend(j['id'] for j in job_group)
    return job_ids



def delete_by_guid(guids):
    """
    Removes a jobs from solr by guid.

    inputs:
        :guids: A list of guids

    outputs:
        The number of jobs that were requested to be deleted. This may
        be higher than the number of actual jobs deleted if a guid
        passed in did not correspond to a job in solr.
    """
    conn = Solr(settings.HAYSTACK_CONNECTIONS['default']['URL'])
    if not guids:
        return 0
    num_guids = len(guids)
    guids = chunk(guids)
    for guid_group in guids:
        delete_str = " OR ".join(guid_group)
        conn.delete(q="guid: (%s)" % delete_str)
    return num_guids


def chunk(iterable, chunk_size=1024):
    """
    Create chunks from a list.

    """
    iterator = iter(iterable)
    for first in iterator:
        yield chain([first], islice(iterator, chunk_size - 1))