# -*- coding: utf-8 -*-
"""
Created on Tue Oct  8 12:10:27 2019

@author: David
"""

import pandas as pd
from sqlalchemy import create_engine
from flask import Flask, jsonify, request, render_template


app = Flask(__name__)


    
#sql = '''SELECT * FROM stops'''
#df = pd.read_sql_query(sql, engine, parse_dates=None, chunksize=None)
    


def get_all_trips_from_station(station, time):

    sql = """
        SELECT st."departure_time", t."trip_id", t."trip_headsign", t."direction_id"
        FROM 
        U556741."STOP_TIMES" AS st      INNER JOIN U556741."STOPS" AS s on st."stop_name" = s."stop_name"  
                                		INNER JOIN U556741."TRIPS" AS t on st."trip_id" = t."trip_id"
        
        WHERE
        s."stop_name" =  '""" + station + """'  AND
        st."departure_time" > '""" + time + """'  AND
        st."departure_time" > '00:00:00' AND st."departure_time" < '23:59:59'
        ORDER BY 
        st."departure_time" ASC
        LIMIT 15
        """

    df = pd.read_sql_query(sql, engine, parse_dates=None, chunksize=None)
    return df


def get_all_stations_from_trip(trip_id):
    trip_id = str(trip_id)
    
    sql = """
        SELECT s."stop_name", t."trip_headsign", st."stop_sequence", st."departure_time"
        FROM 
        U556741."STOP_TIMES" AS st      INNER JOIN U556741."STOPS" AS s on st."stop_name" = s."stop_name"  
                        				INNER JOIN U556741."TRIPS" AS t on st."trip_id" = t."trip_id"
        WHERE
        st."trip_id" = '""" + trip_id + """'
        ORDER BY 
        st."stop_sequence";
        """
    df = pd.read_sql_query(sql, engine, parse_dates=None, chunksize=None)
    return df


def find_correct_trip(trip_id, start_station, end_station):
    try:
        planner_trip = get_all_stations_from_trip(trip_id)
        idx = planner_trip[planner_trip['stop_name'] == start_station].index.values.astype(int)[0]
        #idx_end = planner_next_stations[planner_next_stations['stop_name'] == planner_transfer_station[i]].index.values.astype(int)[0]
        planner_next_stations = planner_trip.loc[idx:]
        tmp = pd.Series(planner_next_stations['stop_name'])
        #check if trip contains transfer_station
        if end_station in tmp.values:
            print("found matching trip")
            idx_end = planner_next_stations[planner_next_stations['stop_name'] == end_station].index.values.astype(int)[0]
            planner_next_stations = planner_trip.loc[idx:idx_end]
            #planner_station_times = planner_station_times.append(planner_next_stations)
            #transfer_time = planner_next_stations[planner_next_stations['stop_name'] == planner_transfer_station[0]]['departure_time'].values[0]
            #break
            return planner_next_stations
        else:
            print("doesn't contain transfer station")
            empty = pd.DataFrame()
            return empty   
    except Exception as e:
        print("Error occured "+ str(e))
        empty = pd.DataFrame()
        return empty   
 
engine = create_engine('hana://u556741:Bcdefgh1@hanaicla.f4.htw-berlin.de:39013/HXE')
#print(engine.table_names())      


@app.route('/test', methods=['POST'])
def test():


    print('Incoming..')
    #print(request.POST.get('city'))
    name = request.form.get('name')        
    print(name)

    
    sql = '''
    CALL "U556741"."NEAREST_WAY_S+U"(
            STARTV => 'U Jakob-Kaiser-Platz ',
            ENDV => 'U Tierpark ',
            ROUTING => ?
            );
    '''
    planner_stations = pd.read_sql_query(sql, engine, parse_dates=None, chunksize=None)
    
    planner_stations = planner_stations.rename(columns={"from_stop_name": "stop_name"})
    planner_stations = planner_stations[['segment', 'route_id', 'route_name', 'stop_name']]
    planner_start_station = planner_stations.iloc[0]['stop_name']
    planner_end_station = planner_stations.iloc[-1]['stop_name']
    
    #find transfer stations
    planner_transfer_station = []
    route_name = ''
    
    for index, row in planner_stations.iterrows():
        route_new = row['route_name']
        
        if route_name == '':
            route_name = row['route_name']
            stop_name = row['stop_name']
            print(route_name)
        if route_name != '' and route_name !=  route_new:
            route_name = row['route_name']
            stop_name = row['stop_name']
            print(route_name)
            planner_transfer_station.append(stop_name)
    
    
    #find trip that contains transfer station
    planner_station_times = pd.DataFrame()
    transfer_time = '16:00:00'
    
    planner_start_stations = [] 
    planner_start_stations.append(planner_start_station)
    planner_start_stations.extend(planner_transfer_station)
    
    planner_transfer_station.append(planner_end_station)
    
    #loop for all transfer stations
    for num, transfer_station in enumerate(planner_transfer_station, start=0):
        print("Start: " + planner_start_stations[num])
        print("End: " + transfer_station)
        #get all trips that depart from given station at given time
        planner_trips = get_all_trips_from_station(planner_start_stations[num], transfer_time)
        
        #find trip that contains transfer station
        for index, row in planner_trips.iterrows():
            trip_id = row['trip_id']
            planner_next_stations = find_correct_trip(trip_id, planner_start_stations[num], transfer_station)
            
            #if data frame is empty
            if planner_next_stations.empty:
                pass
            else:  
                planner_station_times = planner_station_times.append(planner_next_stations)
                transfer_time = planner_next_stations[planner_next_stations['stop_name'] == transfer_station]['departure_time'].values[0]
                print("appended")
                break
        
    df = planner_station_times.reset_index(drop=True)    
    df = df.drop('stop_sequence', 1)
        
    #https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_json.html    
    #UTF8 Problem : https://stackoverflow.com/questions/39612240/writing-pandas-dataframe-to-json-in-unicode
    df = df.to_json(orient='index')
    
    
    #print(request.get_json())  # parse as JSON
    response = jsonify(df)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response  # serialize and use JSON headers
    

if __name__ == '__main__':
  app.run()
