from myreports.presentation.csv import Csv
from myreports.presentation.xlsx import Xlsx


presentation_drivers = {
    'csv': Csv(),
    'xlsx': Xlsx(),
}
