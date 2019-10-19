# -*- coding: utf-8 -*-
"""
Created on Thu Oct 17 20:13:28 2019

@author: David
"""

import pandas as pd
from sqlalchemy import create_engine
from flask import Flask, jsonify, request, render_template

engine = create_engine('hana://u556741:Bcdefgh1@hanaicla.f4.htw-berlin.de:39013/HXE')
print(engine.table_names())     

sql = 'SELECT * FROM u_lines'
planner_stations2 = pd.read_sql_query(sql, engine)

start= "S Mahlow"
end= "U Alt-Tegel "
time= "20:00:00"

sql = """
CALL "U556741"."NEAREST_WAY_S+U"(
        STARTV => '""" + start + """',
        ENDV => '""" + end + """',
        ROUTING => ?
        );
"""
planner_stations = pd.read_sql_query(sql, engine, parse_dates=None, chunksize=None)







# Python program for  
# validation of a graph 
  
# import dictionary for graph 
from collections import defaultdict 
  
# function for adding edge to graph 
graph = defaultdict(list) 
def addEdge(graph,u,v): 
    graph[u].append(v) 
  

# Create a graph given in the above diagram 
for index, station in planner_stations2.iterrows():
    addEdge(graph, station['START'], station['END']) 
  

graph2 = defaultdict(list) 

for k,v in graph.items():
    v = list(dict.fromkeys(v))
    graph2[k] = v 

graph = dict(graph2)
 
graph ={ 
'a':['c'], 
'b':['d'], 
'c':['e'], 
'd':['a', 'd'], 
'e':['b', 'c'] 
} 
     
    
start= "Adenauerplatz"
end= "Alt-Tempelhof"


# function to generate all possible paths 
def find_all_paths(graph, start, end, path =[]): 
    path = path + [start] 
    if start == end: 
        return [path] 
    paths = [] 
    for node in graph[start]: 
        try:
            if node not in path: 
                newpaths = find_all_paths(graph, node, end, path) 
            for newpath in newpaths: 
                paths.append(newpath) 
        except Exception as e:
            print(e)
    return paths 
    
# Driver function call to print all  
# generated paths 
all_paths = find_all_paths(graph, start, end)
