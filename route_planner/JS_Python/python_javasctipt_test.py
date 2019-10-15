# -*- coding: utf-8 -*-
"""
Created on Tue Oct 15 22:06:22 2019

@author: David
"""

  
from flask import Flask, jsonify, request, render_template
app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    return 'Hello World'


@app.route('/test', methods=['POST'])
def test():
    print('I got clicked!')

    # POST request
    if request.method == 'POST':
        print('Incoming..')
        #print(request.POST.get('city'))
        name = request.form.get('name')        
        print(name)
        #print(request.get_json())  # parse as JSON
        response = jsonify({'greeting':'Success'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response  # serialize and use JSON headers


    # GET request
    else:
        message = {'greeting':'Hello from Flask!'}
        return jsonify(message)  # serialize and use JSON headers


if __name__ == '__main__':
  app.run()
  