# -*- coding: utf-8 -*-
"""
Created on Tue Oct  8 12:10:27 2019

@author: David
"""

import pandas as pd
from sqlalchemy import create_engine



 
#sql = '''SELECT * FROM stops'''
#df = pd.read_sql_query(sql, engine, parse_dates=None, chunksize=None)
    


def get_all_trips_from_station(station, time):
    #station = 'S+U Bundesplatz '
    #station= 'S+U Alexanderplatz'
    
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
    
    params = {'trip_id': trip_id}
    sql = '''
    SELECT DISTINCT s.stop_name, t.trip_headsign, st.stop_sequence, st.departure_time
    FROM 
    stop_times st   INNER JOIN stops s on s.stop_name = st.stop_name      
                    INNER JOIN trips t on st.trip_id = t.trip_id
    WHERE
    st.trip_id = %(trip_id)s
    ORDER BY 
    st.stop_sequence
    '''
    df = pd.read_sql_query(sql, engine, params=params, parse_dates=None, chunksize=None)
    return df


def find_correct_trip(trip_id, start_station, end_station):
    #start_station = planner_start_station
    #end_station = planner_end_station
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
    except:
        print("Error occured")
        empty = pd.DataFrame()
        return empty   

 
engine = create_engine('hana://u556741:Bcdefgh1@hanaicla.f4.htw-berlin.de:39013/HXE')A
print(engine.table_names())      

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


#get all trips that depart from given station at given time
planner_trips = get_all_trips_from_station(planner_start_station, '16:00:00')

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
transfer_time = ''

#TODO: loop for all transfer stations
for index, row in planner_trips.iterrows():
    trip_id = row['trip_id']
    planner_next_stations = find_correct_trip(trip_id, planner_start_station, planner_transfer_station[0])
    
    #if data frame is empty
    if planner_next_stations.empty:
        pass
    else:  
        planner_station_times = planner_station_times.append(planner_next_stations)
        transfer_time = planner_next_stations[planner_next_stations['stop_name'] == planner_transfer_station[0]]['departure_time'].values[0]
        print("appended")
        break


#find trip that contains final station
planner_trips = get_all_trips_from_station(planner_transfer_station[-1], transfer_time)

for index, row in planner_trips.iterrows():
    trip_id = row['trip_id']
    planner_next_stations = find_correct_trip(trip_id, planner_transfer_station[-1], planner_end_station)
    
    #if data frame is empty
    if planner_next_stations.empty:
        pass
    else:  
        planner_station_times = planner_station_times.append(planner_next_stations)
        transfer_time = planner_next_stations[planner_next_stations['stop_name'] == planner_transfer_station[-1]]['departure_time'].values[0]
        print("appended")
        break
    
    
#https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_json.html    
json_planner = planner_station_times.to_json(orient='split')