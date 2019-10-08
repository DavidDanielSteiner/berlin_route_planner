# -*- coding: utf-8 -*-
"""
Created on Tue Oct  8 12:10:27 2019

@author: David
"""


from sqlalchemy import create_engine
engine = create_engine('mysql+mysqldb://datastig_admin:v8fLxLatu9Qc8TY@68.66.248.12/datastig_test')

def get_all_trips_from_station(station, time):
    
    params = {'station': station,
              'time': time}
    sql = '''
    SELECT DISTINCT st.departure_time, t.trip_id, t.trip_headsign, t.direction_id
    FROM 
    stop_times st   INNER JOIN stops s on s.stop_name = st.stop_name  
                    INNER JOIN trips t on st.trip_id = t.trip_id
    
    WHERE
    s.stop_name = %(station)s AND
    st.departure_time > %(time)s AND
    st.departure_time> "00:00:00" AND st.departure_time < "23:59:59" 
    GROUP BY
    st.departure_time
    ORDER BY 
    st.departure_time ASC
    LIMIT 15
    '''
    df = pd.read_sql_query(sql, engine, params=params, parse_dates=None, chunksize=None)
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

 


#Graph with stations
s41 = lines[81:90]
u6 = lines [490:494]
planner_stations = s41.append(u6)
planner_start_station = planner_stations.iloc[0]['stop_name']
planner_end_station = planner_stations.iloc[-1]['stop_name']

#u5 = lines[509:512]
#s41 = lines[83:100]
#u7 = lines[434:436]


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