import re
address_line_1_terms = ['alley','aly',
                        'avenue','ave',
                        'beach','bch',
                        'bend','bnd',
                        'boulevard','blvd',
                        'bypass','byp',
                        'causeway','cswy',
                        'center','ctr',
                        'circle','cir',
                        'court','ct',
                        'cove','cv',
                        'creek','crk',
                        'crossing','xing',
                        'crossroad','xrd',
                        'drive','dr',
                        'expressway','expy',
                        'freeway','fwy',
                        'front','frnt',
                        'gateway','gtwy',
                        'harbor','hbr',
                        'heights','hts',
                        'highway','hwy',
                        'junction','jct',
                        'lake','lk',
                        'lane','ln',
                        'parkway','pky',
                        'place','pl',
                        'plain','pln',
                        'plaza','plz',
                        'point','pt',
                        'ranch','rnch',
                        'ridge','rdg',
                        'road','rd',
                        'route','rte',
                        'skyway','skwy',
                        'square','sq',
                        'station','sta',
                        'stravenue','stra',
                        'street','st',
                        'summit','smt',
                        'terrace','ter',
                        'turnpike','tpk',
                        'view','vw']

address_line_2_terms = ['apartment','apt',
                        'building','bldg',
                        'office','ofc',
                        'room','rm',
                        'suite','ste',
                        'trailer','trlr',
                        'lobby','lbby',
                        'hangar','hngr',
                        'floor','fl',
                        'basement','bsmt',
                        'po','p.o.','pobox']

re_beginning_number = re.compile("^(\d+)")
re_address_string = re.compile("s+(%s)s+" % "|".join(address_line_1_terms + address_line_2_terms))
re_address = re.compile("^(\d+)\s+\S+.*\s+(%s)\s" % "|".join(address_line_1_terms))

def identify_address(input_string):
    properties = []
    input_string = input_string.strip().lower()
    match = re_beginning_number.match(input_string)
    if match:
        properties.append('begnumber')
    else:
        properties.append('nobeg')

    match = re_address_string.match(input_string)
    if match:
        properties.append('keywordfound')
    else:
        properties.append('nokw')

    match = re_address.match(input_string)
    if match:
        properties.append('formatmatch')
    else:
        properties.append('noformat')

    return properties