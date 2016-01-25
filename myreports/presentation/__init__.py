from myreports.presentation.csv import Csv
from myreports.presentation.xlsx import Xlsx
from myreports.presentation.jsonpass import JsonPass

presentation_drivers = {
    'csv': Csv(),
    'xlsx': Xlsx(),
    'json_pass': JsonPass(),
}
