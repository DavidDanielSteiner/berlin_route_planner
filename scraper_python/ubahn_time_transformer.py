# -*- coding: utf-8 -*-
"""
Created on Thu Sep 19 14:19:32 2019

@author: David
"""



# importing all the required modules
import PyPDF2
import pandas as pd


df_all = pd.DataFrame()
number = 5

#def read_PDF(number):

# creating an object 
file = open('U'+str(number)+'.pdf', 'rb')

# creating a pdf reader object
fileReader = PyPDF2.PdfFileReader(file)

# print the number of pages in pdf file
pages = fileReader.numPages
   
for page in range(1):
    
    pageObj = fileReader.getPage(page)
    text = pageObj.extractText()

    #station_list = getStationList(text)
    #df_all = getStatationDataFrame(station_list)





# =============================================================================
# Test
# =============================================================================





#def getStationList(text):
    table_list = []
    station_list = []
    station = []
    line_number = 0
    
    for line in text.splitlines():
        line_number += 1
        #skip first 21 lines in text
        if(line_number > 21):
            #make new list when a new UBahn station is in text
            if('Montag' in line):
                print(line)
                table_list.append(station_list)
                
                
                
            if('U' in line):
                #print(line)
                station = []
                station.append(line)
                station_list.append(station)
            elif('Quelle' in line):
                pass
                #print(line)
                #append time entries to list
            elif(':' in line):
                station.append(line)
            elif('.' in line):
                station.append(line)    
            else:
                pass
                #print(line)
                
    #return station_list
        
        
#def getStatationDataFrame(station_list):        
    first_station_length = len(station_list[0]) 
    df = pd.DataFrame()
    
    for station in station_list:
        if(len(station) == first_station_length):
            df[str(station[0])] = station
        else:
            print(station)
    
    df = df[1:]
    
    df_all = pd.concat([df_all, df])
    
    #return df_all
    
            
        

    
    

