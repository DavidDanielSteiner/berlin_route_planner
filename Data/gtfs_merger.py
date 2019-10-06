# -*- coding: utf-8 -*-
"""
Created on Thu Sep 19 18:39:57 2019

@author: David
"""
# =============================================================================
# Import
# =============================================================================

import pandas as pd


stops = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\stops.txt', sep=",", encoding="utf-8")
stop_times = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\stop_times.txt', sep=",", encoding="utf-8")
routes = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\routes.txt', sep=",", encoding="utf-8")
trips = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\trips.txt', sep=",", encoding="utf-8")
stop_times = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\stop_times.txt', sep=",", encoding="utf-8")
agency = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\agency.txt', sep=",", encoding="utf-8")

#calendar = pd.read_csv('calendar.txt', sep=",", encoding="utf-8")
#shapes = pd.read_csv('shapes.txt', sep=",", encoding="utf-8")
#transfers = pd.read_csv(r'C:\Users\David\OneDrive\Documents\Datasets\GTFS\transfers.txt', sep=",", encoding="utf-8")


# =============================================================================
# Filter Berlin Routes
# =============================================================================
 #stops_berlin = stops[stops['stop_name'].str.contains(r'\(Berlin\)')]
#stops_berlin = stops_berlin.replace(regex=[r'\(Berlin\)'], value='')
#stops_berlin = stops_berlin[['stop_id', 'stop_name', 'stop_lat', 'stop_lon']]
#stops_berlin = stops_berlin.drop_duplicates(subset=['stop_id'], keep='last')

agency_berlin = agency[(agency['agency_id'] == 1) | (agency['agency_id'] == 796)]

routes_berlin = pd.merge(agency_berlin, routes, on='agency_id', how='inner')
routes_berlin = routes_berlin[['route_id', 'route_short_name', 'route_type', 'agency_id']]
routes_berlin = routes_berlin[routes_berlin['route_short_name'].str.contains('U|S')]

trips_berlin = pd.merge(routes_berlin, trips, on='route_id', how='inner')
trips_berlin = trips_berlin[['route_id', 'service_id', 'trip_id', 'trip_headsign', 'direction_id', 'shape_id']]

stop_times_berlin = pd.merge(stop_times, trips_berlin, on='trip_id', how='inner')
stop_times_berlin = stop_times_berlin[['trip_id', 'stop_id', 'arrival_time', 'departure_time', 'stop_sequence']]

stops_berlin = pd.merge(stop_times_berlin, stops, on='stop_id', how='inner')
stops_berlin = stops_berlin.drop_duplicates(subset=['stop_id'], keep='last')
stops_berlin = stops_berlin[['stop_id', 'stop_name', 'stop_lat', 'stop_lon']]
stops_berlin = stops_berlin.replace(regex=[r'\(Berlin\)'], value='') #delete (Berlin)
stops_berlin = stops_berlin.replace(regex=[r'\[.*?\]'], value='') #delete [U5]
#stops_berlin = stops_berlin.drop_duplicates(subset=['stop_name'], keep='last')
stops_berlin = stops_berlin.reset_index()
stops_berlin = stops_berlin[['stop_id', 'stop_name', 'stop_lat', 'stop_lon']]

#transfers = transfers.drop(columns=['from_trip_id', 'to_trip_id'])
#transfers_berlin = pd.merge(stops_berlin, transfers, left_on='stop_id', right_on='from_stop_id')
#transfers_berlin = transfers_berlin[['from_stop_id', 'to_stop_id', 'min_transfer_time', 'from_route_id', 'to_route_id']]

#replace stop_id with stop_name
stop_times_berlin = pd.merge(stop_times_berlin, stops_berlin, how='inner', on="stop_id")
stop_times_berlin = stop_times_berlin[['trip_id', 'stop_name', 'arrival_time', 'departure_time', 'stop_sequence']]


# =============================================================================
# Create new tables
# =============================================================================

#stations table
stations = stops_berlin.drop_duplicates(subset='stop_name')
stations = stations.reset_index(drop=True)
del stations['stop_id']



#lines table
lines = pd.DataFrame()
routes_new = routes_berlin[routes_berlin['route_type'] != 700]
routes_new = routes_new.drop_duplicates(subset='route_short_name', keep='last')

#Für jede route alle trips
for index, row in routes_new.iterrows():
    route_id = (row['route_id'])
    route_name = (row['route_short_name'])

    tmp = pd.merge(trips_berlin, routes_new, how='inner', on='route_id')
    aRoute = tmp[tmp['route_short_name'] == route_name]
    aTrips = pd.merge(aRoute, stop_times_berlin,  how='inner', on='trip_id')
    #aTrips.drop_duplicates(subset='stop_name')
    
    #Für route trip mit maximalen stationen
    try:
        max_sequence = aTrips['stop_sequence'].idxmax()
        aMaxTrip_id = int(aTrips[max_sequence:max_sequence+1]['trip_id'])
    
        #Alle Stationen für Trip
        all_Stations_Trip = stop_times_berlin[stop_times_berlin['trip_id'] == aMaxTrip_id]
        all_Stations_Trip = pd.merge(all_Stations_Trip, stations, how='inner', on='stop_name')
        all_Stations_Trip = all_Stations_Trip[['stop_name', 'stop_sequence']]
        all_Stations_Trip['route_name']=route_name
        all_Stations_Trip['route_id']=route_id
        all_Stations_Trip = all_Stations_Trip.sort_values('stop_sequence')
        lines = lines.append(all_Stations_Trip)
        print(route_name)
    except Exception as e:
        print(e)
lines = lines.reset_index(drop=True)








# =============================================================================
# CSV export
# =============================================================================

stops_berlin.to_csv("stops_berlin.csv", sep=',', index=True, index_label='index', encoding="utf-8")
stop_times_berlin.to_csv("stop_times.csv", sep=',', index=True, index_label='index', encoding="utf-8")
trips_berlin.to_csv("trips.csv", sep=',', index=True, index_label='index', encoding="utf-8")
routes_berlin.to_csv("routes.csv", sep=',', index=True, index_label='index', encoding="utf-8")
transfers_berlin.to_csv("transfers.csv", sep=',', index=True, index_label='index', encoding="utf-8")
#calendar.to_csv("calendar.csv", sep=',', index=False, encoding="utf-8")
#agency_berlin.to_csv("agency.csv", sep=',', index=False, encoding="utf-8")
#shapes.to_csv("shapes.csv", sep=',', index=False, encoding="utf-8")
lines.to_csv("lines.csv", sep=',', index=True, index_label='index', encoding="utf-8")
stations.to_csv("stations.csv", sep=',', index=True, index_label='index', encoding="utf-8")

# =============================================================================
# DB Upload
# =============================================================================

from sqlalchemy import create_engine
engine = create_engine('mysql+mysqldb://root:''@localhost/gtfs_berlin', echo = False)
print(engine.table_names())        

stops_berlin.to_sql("stops", engine, if_exists='replace')
routes_berlin.to_sql("routes", engine, if_exists='replace')
trips_berlin.to_sql("trips", engine, if_exists='replace')
stop_times_berlin.to_sql("stop_times", engine, if_exists='replace')
agency.to_sql("agency", engine, if_exists='replace')

#transfers.to_sql("transfers", engine, if_exists='replace')
#calendar.to_sql("calendar", engine, if_exists='replace')

# =============================================================================
# SQL queries
# =============================================================================

#https://developers.google.com/transit/gtfs/reference
#https://stackoverflow.com/questions/21212588/gtfs-query-to-list-all-departure-and-arrival-times-between-two-stop-names
#ER DIAGRAMM: https://repository.genmymodel.com/BayanAbdullah/GTFS



#2. Get all stations from start_station to end_station (hana graph)
#3. Select trip where arrival_time is closest to time.now()


#trips that depart from station at given time  
q = engine.execute('''    
SELECT t.trip_id, t.trip_headsign, st.departure_time, t.direction_id
FROM 
stop_times st   INNER JOIN stops s on s.stop_id = st.stop_id      
                INNER JOIN trips t on st.trip_id = t.trip_id

WHERE
s.stop_name = 'U Frankfurter Tor' AND
st.departure_time > '16:00:00' AND
st.departure_time> "00:00:00" AND st.departure_time < "23:59:59" 

ORDER BY 
st.departure_time ASC
LIMIT 10
''')
for row in q:
    print(row)
    


#all stations and arrival + departure times for one trip
q = engine.execute('''    
SELECT s.stop_name, t.trip_headsign, st.stop_sequence, st.departure_time
FROM 
stop_times st   INNER JOIN stops s on s.stop_id = st.stop_id      
                INNER JOIN trips t on st.trip_id = t.trip_id
WHERE
st.trip_id = 120956048
ORDER BY 
st.stop_sequence

''')
for row in q:
    print(row)  



#all stations for one route v1
q = engine.execute(
"""
SELECT stop_id, stop_name FROM stops WHERE stop_id IN (
  SELECT DISTINCT stop_id FROM stop_times WHERE trip_id IN (
    SELECT DISTINCT trip_id FROM trips WHERE route_id = %(route_id)s))
""", 
route_id='17518_400'
)
for row in q:
    print(row)


#all stations for one route v2 (with stop_sequence)
q = engine.execute(
"""
SELECT s.stop_name, s.stop_id, st.stop_sequence, t.trip_headsign
FROM 
trips t INNER JOIN stop_times st on t.trip_id = st.trip_id
        INNER JOIN stops s on s.stop_id = st.stop_id
        INNER JOIN
        
WHERE
t.route_id='17518_400'
"""
)
for row in q:
    print(row)
    
    
    
    
    
    
    
    
    
    
    
    
# =============================================================================
# Test
# =============================================================================


SELECT t.trip_id,
       start_s.stop_name as departure_stop,
       start_st.departure_time,
       direction_id as direction,
       end_s.stop_name as arrival_stop,
       end_st.arrival_time
FROM
trips t INNER JOIN calendar c ON t.service_id = c.service_id
        INNER JOIN routes r ON t.route_id = r.route_id
        INNER JOIN stop_times start_st ON t.trip_id = start_st.trip_id
        INNER JOIN stops start_s ON start_st.stop_id = start_s.stop_id
        INNER JOIN stop_times end_st ON t.trip_id = end_st.trip_id
        INNER JOIN stops end_s ON end_st.stop_id = end_s.stop_id
WHERE c.monday = 1 
  AND direction_id = 1
  AND start_st.departure_time > "00:00:00" AND start_st.departure_time < "23:59:59" 
  AND r.route_id = 1
  AND start_s.stop_id = 42
  AND end_s.stop_id = 1


SELECT * FROM stop_times st inner join stops s on st.stop_id = s.stop_id WHERE trip_id = 120958873 


# =============================================================================
# 
# =============================================================================

lines = pd.read_csv('lines.csv')
stations = pd.read_csv('stations.csv')
stop_times = pd.read_csv('stop_times.csv')

#1. select trip with nearest arrival_time for specific station (stop_time)
#2 Check where 

U5, Tierpark , 
U5, Frankfurter Tor 
U5/U2, Akexanderplatz
U2, Hackescher Markt







q = engine.execute('''    
SELECT t.trip_id, t.trip_headsign, st.departure_time, t.direction_id
FROM 
stop_times st   INNER JOIN stops s on s.stop_id = st.stop_id      
                INNER JOIN trips t on st.trip_id = t.trip_id

WHERE
s.stop_name = 'U Frankfurter Tor' AND
st.departure_time > '16:00:00' AND
st.departure_time> "00:00:00" AND st.departure_time < "23:59:59" 

ORDER BY 
st.departure_time ASC
LIMIT 10
''')
for row in q:
    print(row)



