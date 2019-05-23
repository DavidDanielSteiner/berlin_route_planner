# -*- coding: utf-8 -*-
"""
Created on Thu May 23 23:28:30 2019

@author: David
"""


# =============================================================================
# 
# =============================================================================
url = 'https://de.wikipedia.org/wiki/Liste_der_Berliner_U-Bahnh%C3%B6fe'
resp = requests.get(url)
soup = BeautifulSoup(resp.text, 'lxml')



stationTable = soup.findAll('table',{"class":"wikitable sortable"})[1]
stationTable_rows = stationTable.find_all('tr')   

l = []
for tr in stationTable_rows:
    td = tr.find_all('td')
    td[1].find('a').getText()
     
    row = [tr.text for tr in td]
    l.append(row)
       
pd.DataFrame(l, columns=["A", "B", ...])



txt = "apple#banana#cherry#orange"
x = txt.split("#", 1)

https://de.wikipedia.org/wiki/U-Bahnhof_Afrikanische_Stra%C3%9Fe

td[0]

for a in td[0].find_all('a')
    print(a['href'])
    
td[0].find('a')['href']
    
station_data.append(a.getText())
    
    
#img = td[1].find('img', alt=True)
#print(img['alt'])

      
      
find('data-sort-value')

soup.select('span#volume')[0].text
    
    
    print("Found the URL:", a['href'])
    
    
x.find_all('a'):
    a.getText()
    
    
    print "Found the URL:", a['href']
    
    <a href="/wiki/U-Bahnhof_Adenauerplatz" title="U-Bahnhof Adenauerplatz">Adenauerplatz</a>
    <a class="external text" href="https://tools.wmflabs.org/geohack/geohack.php?pagename=Liste_der_Berliner_U-Bahnh%C3%B6fe&amp;language=de&amp;params=52.499722_N_13.307222_E_region:DE-BE_type:landmark&amp;title=Adenauerplatz">52° 29′ 59″ N, 13° 18′ 26″ O</a>


for tag in td:
    td[1].find('a').getText()
    for a in soup.find_all('a', href=True):
    print "Found the URL:", a['href']


td data-sort-value="Adenauerplatz"><span id="A"></span><a href="/wiki/U-Bahnhof_Adenauerplatz" title="U-Bahnhof Adenauerplatz">Adenauerplatz</a> (Ad)<br/><small><span class="plainlinks-print" id="Adenauerplatz" title="Koordinate"><a class="external text" href="https://tools.wmflabs.org/geohack/geohack.php?pagename=Liste_der_Berliner_U-Bahnh%C3%B6fe&amp;language=de&amp;params=52.499722_N_13.307222_E_region:DE-BE_type:landmark&amp;title=Adenauerplatz">52° 29′ 59″ N, 13° 18′ 26″ O</a></span></small></td>

rows[2]            
for row in rows:
    cells = row.find_all(['th', 'td'])  
    print(cells)


    
    
    
    
    for cell in cells:
        # DO SOMETHING
        if cell.string: print (cell.string)
