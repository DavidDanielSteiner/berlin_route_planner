# -*- coding: utf-8 -*-
"""
Created on Thu May 23 15:31:52 2019

@author: David
"""

import mysql.connector
import requests
from bs4 import BeautifulSoup
import pandas as pd
import re

def convert_dms_to_decimal(dms):
    decimal = (((int(dms[2]) /60) + int(dms[1]))/60 + int(dms[0]))
    return decimal


url = 'https://de.wikipedia.org/wiki/Liste_der_Berliner_U-Bahnh%C3%B6fe'
resp = requests.get(url)
soup = BeautifulSoup(resp.text, 'lxml')

stationTable = soup.findAll('table',{"class":"wikitable sortable"})[1]
stationTable_rows = stationTable.find_all('tr')   

stations_data = []

stationTable_rows = stationTable_rows[1:]

for num, element in enumerate(stationTable_rows, start =0): 
    
    station_data = []    
    td = stationTable_rows[num].find_all('td')
            
    for num, element in enumerate(td[0].find_all('a'), start=0):
        if num == 1:
            geodata = element.getText()
            geodata_split = geodata.split(',')
            geodata_split[0]       
            latitude_dms = re.findall("[-+]?[.]?[\d]+(?:,\d\d\d)*[\.]?\d*(?:[eE][-+]?\d+)?", geodata_split[0])
            latitude = convert_dms_to_decimal(latitude_dms)
            longitude_dms = re.findall("[-+]?[.]?[\d]+(?:,\d\d\d)*[\.]?\d*(?:[eE][-+]?\d+)?", geodata_split[1])
            longitude = convert_dms_to_decimal(longitude_dms) 
            station_data.append(latitude)
            station_data.append(longitude)
        else:
            station_name = element.getText()
            station_name = re.sub(r'\([^)]*\)', '', station_name)
            station_data.append(station_name.rstrip())
                
    #station_data.append(td[1]['data-sort-value'])
    station_data.append(td[4].getText())
    station_data.append('https://de.wikipedia.org' + td[0].find('a')['href']) 
    stations_data.append(station_data)

#df=pd.DataFrame(stations_data ,columns=['station_name','latitude','longitude','line_name','district_name', 'station_link'])  
df_allStations=pd.DataFrame(stations_data ,columns=['station_name','latitude','longitude','district_name', 'station_link'])  
df_allStations = df_allStations.dropna()
df_allStations.drop_duplicates(subset ="station_name", keep = 'first', inplace = True) 

df_allStations.to_csv ('station_data.csv', index = None, header=True) 


