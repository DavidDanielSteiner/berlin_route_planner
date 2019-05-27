# -*- coding: utf-8 -*-

"""
Created on Thu May 23 23:28:30 2019
@author: David
"""



import requests
from bs4 import BeautifulSoup
import pandas as pd
import re

stations_data = []

for i in range(1, 10):
    url = 'https://de.wikipedia.org/wiki/U-Bahn-Linie_' + str(i) + '_(Berlin)'
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'lxml')
    
    #get Table with Station Data
    stationTable = soup.findAll('table',{"class":"noviewer"})[0]
    stationTable
    #loop all Table Rows
    stationTable_rows = stationTable.findAll('tr')   
    station_order = 0
    
    for element in stationTable_rows:       
        station_data = []    
        #get Tablecells
        td = element.find_all('td')
        try:
            tmp = td[2].getText()  # == (WA)
            if(re.search('\(', tmp) or i == 7):
                station_name = td[2].find('a').getText()
                station_name = re.sub(r'\([^)]*\)', '', station_name)
                station_data.append(station_name.rstrip()) #['title']) # == Warschauer Straße 
                station_order +=1
                station_data.append(str(i) + str(station_order).zfill(2))
                station_data.append('U' + str(i))
                stations_data.append(station_data)
            else:
                print('no station')
        except:
            print("An exception occurred")

df=pd.DataFrame(stations_data ,columns=['station_name','station_id','line_name'])  
#df.drop_duplicates(subset ="station_name", keep = 'first', inplace = True)  
   
df.to_csv ('subway_lines.csv', index = None, header=True) 

#check which stations are missing 
df_new = pd.merge(df, df_allStations, on='station_name', how='inner')
#df_new_2 = df[(~df.station_name.isin(df_new.station_name))&(~df.station_name.isin(df_new.station_name))]
df_new.to_csv ('merged_data.csv', index = None, header=True) 
