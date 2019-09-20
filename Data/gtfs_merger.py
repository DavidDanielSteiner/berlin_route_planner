# -*- coding: utf-8 -*-
"""
Created on Thu Sep 19 18:39:57 2019

@author: David
"""

import pandas as pd

stops = pd.read_csv('stops.txt', sep=",", encoding="utf-8")
stops_berlin = stops[stops['stop_name'].str.contains(r'\(Berlin\)')]
stops_berlin = stops_berlin.replace(regex=[r'\(Berlin\)'], value='')
stops_berlin = stops_berlin[['stop_id', 'stop_name', 'stop_lat', 'stop_lon']]
stops_berlin.to_csv("stops_berlin.csv", sep=',', index=False, encoding="utf-8")

stop_times = pd.read_csv('stop_times.txt', sep=",", encoding="utf-8")
stop_times = stop_times[['trip_id', 'stop_id', 'arrival_time', 'stop_sequence']]
stop_times.to_csv("stop_times.csv", sep=',', index=False, encoding="utf-8")

routes = pd.read_csv('routes.txt', sep=",", encoding="utf-8")
routes = routes[['route_id', 'route_short_name', 'route_type']]
routes.to_csv("routes.csv", sep=',', index=False, encoding="utf-8")

transfers = pd.read_csv('transfers.txt', sep=",", encoding="utf-8")
transfers = transfers.drop(columns=['from_trip_id', 'to_trip_id'])
transfers.to_csv("transfers.csv", sep=',', index=False, encoding="utf-8")

trips = pd.read_csv('trips.txt', sep=",", encoding="utf-8")
trips = trips.drop(columns=['block_id', 'wheelchair_accessible', 'bikes_allowed'])
trips.to_csv("trips.csv", sep=',', index=False, encoding="utf-8")

shapes = pd.read_csv('shapes.txt', sep=",", encoding="utf-8")
shapes.to_csv("shapes.csv", sep=',', index=False, encoding="utf-8")


# =============================================================================
# 
# =============================================================================

#Merge
#routes (route_id /from_route_id) transfers (stop id / from_stop_id) stops (stop_id) stop times


x = pd.merge(transfers, routes, on='subject_id', how='inner')
u5_stations = transfers[transfers['from_route_id'] == '17518_400']
u5_stations_merge = pd.merge(stops, u5_stations, left_on='stop_id', right_on='from_stop_id', how='inner')

