#!/usr/bin/env python3

import argparse

from os import path
from random import randint
from requests import Session
from time import sleep

seed = 300
session = Session()
firstnames = ['Testy']
lastnames = ['McTestyFace']
fish = ['Northern', 'Walleye', 'Bass', 'Yellow Perch', 'Bluegill',
        'Crappie', 'Pumpkinseed', 'Sunfish']

#from lib.util import display


def parse_args():
    parser = argparse.ArgumentParser(description='Test jigsup site')

    parser.add_argument('-U', '--url', type=str, nargs='?',
                        default='http://localhost:3000',
                        help='site url')
    parser.add_argument('-n', '--number', type=int, nargs='?',
                        default=5,
                        help='number of tests')
    parser.add_argument('-s', '--sleep', type=int, nargs='?',
                        default=2,
                        help='random sleep up to seconds')
    parser.add_argument('-u', '--username', type=str, nargs='?',
                        default='admin',
                        help='username')
    parser.add_argument('-p', '--password', type=str, nargs='?',
                        default='Abc123!',
                        help='password')
    parser.add_argument('-F', '--firstnames', type=str, nargs='?',
                        default='',
                        help='file with first names')
    parser.add_argument('-L', '--lastnames', type=str, nargs='?',
                        default='',
                        help='file with last names')

    parser.add_argument('-D', '--debug', action='store_true',
                        help='debug by not sending web requests')

    parser.add_argument('seed', type=int, nargs=1,
                        help='number to start the ticket at')

    return parser.parse_args()


def read_file_list(filename, default):
    if path.isfile(filename):
        items = []
        with open(filename, 'r') as file_in:
            items = file_in.read().strip().split('\n')
        return [i.strip() for i in items]
    else:
        return default



def login_site(url, username, password):
    url = '{}/login'.format(url)
    data = {
        'username': username,
        'password': password
    }

    res = session.post(url, data=data)

    return res.status_code == 200 and 'Login Attempt Failed' not in res.text


def add_ticket(number, debug=False):
    global firstnames, lastnames, fish, seed

    test = seed + number
    data = {
        'ticketNumber': '{}'.format(test),
        'firstName': '{}'.format(firstnames[randint(0, len(firstnames) - 1)]),
        'lastName': '{}'.format(lastnames[randint(0, len(lastnames) - 1)], test),
        'fish': fish[randint(0, len(fish) - 1)],
        'weight': '{}.{}'.format(randint(1, 20), randint(0, 9))
    }

    print('Test {}: {} {} - {} - {}'.format(test,
                                            data['firstName'],
                                            data['lastName'],
                                            data['fish'],
                                            data['weight']))

    if not debug:
        res = session.post('{}/ticket'.format(args.url), data=data)


if __name__ == '__main__':
    args = parse_args()

    seed = args.seed[0]

    if args.firstnames:
        print('Reading firstnames: {}'.format(args.firstnames))
        firstnames = read_file_list(args.firstnames, firstnames)

    if args.lastnames:
        print('Reading lastnames: {}'.format(args.lastnames))
        lastnames = read_file_list(args.lastnames, lastnames)

    if args.debug or login_site(args.url, args.username, args.password):
        if not args.debug:
            print('Logged in.')

        print('Start.')
        for number in range(args.number):
            sleep(randint(0, args.sleep))
            add_ticket(number, args.debug)
        print('Done.')

    else:
        print('NOT logged in.')

