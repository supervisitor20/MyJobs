import json


def get_state_map():
    states = open('jsondata/usa_regions.json')
    data_list = json.loads(states.read())['regions']
    state_map = dict([(x['name'], x['code']) for x in data_list])
    state_map['None'] = 'None'
    return state_map


# A dict that maps state names and their abbreviations to valid synonyms. For
# example, synonyms['IN'] and synonyms['Indiana'] both return ['IN',
# 'Indiana'].
synonyms = dict(
    [(key.lower(), [key, value]) for key, value in get_state_map().items()] +
    [(value.lower(), [key, value]) for key, value in get_state_map().items()])
