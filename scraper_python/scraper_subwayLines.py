# -*- coding: utf-8 -*-
"""
Created on Fri May 24 16:04:13 2019

@author: U722571
"""

# -*- coding: utf-8 -*-
"""
Created on Thu May 23 23:28:30 2019
@author: David
"""


# =============================================================================
# 
# =============================================================================


import requests
from bs4 import BeautifulSoup
import pandas as pd
import re



# =============================================================================
#    RegEx 
# =============================================================================
    
import re
s = 'I love book()'
result = re.search(r'\(\)',s)
print result.group()
s1 = 'I love book(s)'
result2 = re.sub(r'[\(\)]','',s1)
print result2


patterns = [ '\(', '\)']
text = 'Does this text() match the pattern?'

for pattern in patterns:
    print('Looking for "%s" in "%s" ->' % (pattern, text)),

    if re.search(pattern,  text):
        print('found a match!')
    else:
        print('no match')



patterns = '\('
text = 'xt'

if re.search(pattern,  text):
    print('found a match!')
else:
    print('no match')


stations_data = []

#for i in range(10):
    
i = 1

url = 'https://de.wikipedia.org/wiki/U-Bahn-Linie_' + i + '_(Berlin)'
resp = requests.get(url)
soup = BeautifulSoup(resp.text, 'lxml')

#get Table with Station Data
stationTable = soup.findAll('table',{"class":"noviewer"})

#loop all Table Rows
stationTable_rows = stationTable.find_all('tr')   
for num, element in enumerate(stationTable_rows, start =1): 
    
    station_data = []    
    #get Tablecells
    td = stationTable_rows[num].find_all('td')
    
    if td[2].getText 
    print(td[2].find('a')['href']) # == Warschauer Straße 
    tmp = td[2].getText())  # == (WA)
    #td[2]['a']['href'].getText()
    station_data.append(i + num)
    station_data.append('U' + i)
    stations_data.append(station_data)

df=pd.DataFrame(stations_data ,columns=['station_name','station_id','line_name'])  
    
df.to_csv (r'C:\Users\David\Desktop\subway_lines.csv', index = None, header=True) 
    

# =============================================================================
# for a in td[0].find_all('a')
#     print(a['href'])
#     
# td[0].find('a')['href']
# 
# =============================================================================

# =============================================================================
# HTML CODE
# =============================================================================

<td class="Vorlage_BS-table" colspan="2" style="padding:12px;"><div class="noprint" style="text-align:right;"><small><a href="/wiki/Wikipedia:Formatvorlage_Bahnstrecke/Legende" title="Wikipedia:Formatvorlage Bahnstrecke/Legende">Legende</a></small></div>
<table class="noviewer" cellpadding="0" style="border-collapse:collapse; line-height:1.2; white-space:nowrap;">



<tbody><tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uKBHFa.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/1/1f/BSicon_uKBHFa.svg/20px-BSicon_uKBHFa.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/1/1f/BSicon_uKBHFa.svg/30px-BSicon_uKBHFa.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/1/1f/BSicon_uKBHFa.svg/40px-BSicon_uKBHFa.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>

<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">8,7
</td>

<td style="padding:0; border:none;" colspan="2"><a href="/wiki/Bahnhof_Berlin_Warschauer_Stra%C3%9Fe" title="Bahnhof Berlin Warschauer Straße">Warschauer Straße</a> (WA) <small><br><a href="/wiki/S-Bahn_Berlin#S3" title="S-Bahn Berlin#S3"><img alt="S3" src="//upload.wikimedia.org/wikipedia/commons/thumb/2/21/Berlin_S3.svg/26px-Berlin_S3.svg.png" decoding="async" width="26" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/2/21/Berlin_S3.svg/40px-Berlin_S3.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/2/21/Berlin_S3.svg/52px-Berlin_S3.svg.png 2x" data-file-width="514" data-file-height="257"></a> <a href="/wiki/S-Bahn_Berlin#S5" title="S-Bahn Berlin#S5"><img alt="S5" src="//upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Berlin_S5.svg/26px-Berlin_S5.svg.png" decoding="async" width="26" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Berlin_S5.svg/40px-Berlin_S5.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Berlin_S5.svg/52px-Berlin_S5.svg.png 2x" data-file-width="514" data-file-height="257"></a> <a href="/wiki/S-Bahn_Berlin#S7" title="S-Bahn Berlin#S7"><img alt="S7" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Berlin_S7.svg/26px-Berlin_S7.svg.png" decoding="async" width="26" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Berlin_S7.svg/40px-Berlin_S7.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Berlin_S7.svg/52px-Berlin_S7.svg.png 2x" data-file-width="514" data-file-height="257"></a> <a href="/wiki/S-Bahn_Berlin#S9" title="S-Bahn Berlin#S9"><img alt="S9" src="//upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Berlin_S9.svg/26px-Berlin_S9.svg.png" decoding="async" width="26" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Berlin_S9.svg/40px-Berlin_S9.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Berlin_S9.svg/52px-Berlin_S9.svg.png 2x" data-file-width="514" data-file-height="257"></a> <a href="/wiki/U-Bahn-Linie_3_(Berlin)" title="U-Bahn-Linie 3 (Berlin)"><img alt="U3" src="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/22px-Berlin_U3.svg.png" decoding="async" width="22" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/34px-Berlin_U3.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/44px-Berlin_U3.svg.png 2x" data-file-width="436" data-file-height="258"></a></small>
</td></tr>



<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; height:0;"><div style="position:absolute; left:0; right:0; bottom:0; width:100%; z-index:1; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uSTR.svg" class="image"><img alt="BSicon uSTR.svg" src="//upload.wikimedia.org/wikipedia/commons/thumb/a/a3/BSicon_uSTR.svg/20px-BSicon_uSTR.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/a/a3/BSicon_uSTR.svg/30px-BSicon_uSTR.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/a/a3/BSicon_uSTR.svg/40px-BSicon_uSTR.svg.png 2x" data-file-width="500" data-file-height="500"></a></div></div>
</td>
<td style="padding:0; border:none;">
</td>
<td style="padding:0; border:none; width:100%;">
</td>
<td style="padding:0; border:none;">
</td></tr>


<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uABZg%2Bl.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/6/6b/BSicon_uABZg%2Bl.svg/20px-BSicon_uABZg%2Bl.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/6/6b/BSicon_uABZg%2Bl.svg/30px-BSicon_uABZg%2Bl.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/6/6b/BSicon_uABZg%2Bl.svg/40px-BSicon_uABZg%2Bl.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>
<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">
</td>
<td style="padding:0; border:none;" colspan="2"><small>zur Abstellanlage Warschauer Straße</small>
</td></tr>




<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_ueHST.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/5/57/BSicon_ueHST.svg/20px-BSicon_ueHST.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/5/57/BSicon_ueHST.svg/30px-BSicon_ueHST.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/5/57/BSicon_ueHST.svg/40px-BSicon_ueHST.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>
<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">
</td>
<td style="padding:0; border:none;" colspan="2"><small><a href="/wiki/U-Bahnhof_Osthafen" title="U-Bahnhof Osthafen">Osthafen</a> <small>bis 1945</small></small>
</td></tr>




<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uBHF.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BSicon_uBHF.svg/20px-BSicon_uBHF.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BSicon_uBHF.svg/30px-BSicon_uBHF.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BSicon_uBHF.svg/40px-BSicon_uBHF.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>
<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">7,9
</td>
<td style="padding:0; border:none;" colspan="2"><a href="/wiki/U-Bahnhof_Schlesisches_Tor" title="U-Bahnhof Schlesisches Tor">Schlesisches Tor</a> (S) <small><a href="/wiki/U-Bahn-Linie_3_(Berlin)" title="U-Bahn-Linie 3 (Berlin)"><img alt="U3" src="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/22px-Berlin_U3.svg.png" decoding="async" width="22" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/34px-Berlin_U3.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/44px-Berlin_U3.svg.png 2x" data-file-width="436" data-file-height="258"></a></small>
</td></tr>




<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uHST.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/2/2d/BSicon_uHST.svg/20px-BSicon_uHST.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/2/2d/BSicon_uHST.svg/30px-BSicon_uHST.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/2/2d/BSicon_uHST.svg/40px-BSicon_uHST.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>
<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">7,0
</td>
<td style="padding:0; border:none;" colspan="2"><a href="/wiki/U-Bahnhof_G%C3%B6rlitzer_Bahnhof" title="U-Bahnhof Görlitzer Bahnhof">Görlitzer Bahnhof</a> (Gr) <small><a href="/wiki/U-Bahn-Linie_3_(Berlin)" title="U-Bahn-Linie 3 (Berlin)"><img alt="U3" src="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/22px-Berlin_U3.svg.png" decoding="async" width="22" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/34px-Berlin_U3.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/44px-Berlin_U3.svg.png 2x" data-file-width="436" data-file-height="258"></a></small>
</td></tr>




<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uBHF.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BSicon_uBHF.svg/20px-BSicon_uBHF.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BSicon_uBHF.svg/30px-BSicon_uBHF.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BSicon_uBHF.svg/40px-BSicon_uBHF.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>
<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">6,3
</td>
<td style="padding:0; border:none;" colspan="2"><a href="/wiki/U-Bahnhof_Kottbusser_Tor" title="U-Bahnhof Kottbusser Tor">Kottbusser Tor</a> (Kbo) <small><a href="/wiki/U-Bahn-Linie_3_(Berlin)" title="U-Bahn-Linie 3 (Berlin)"><img alt="U3" src="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/22px-Berlin_U3.svg.png" decoding="async" width="22" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/34px-Berlin_U3.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/44px-Berlin_U3.svg.png 2x" data-file-width="436" data-file-height="258"></a> <a href="/wiki/U-Bahn-Linie_8_(Berlin)" title="U-Bahn-Linie 8 (Berlin)"><img alt="U8" src="//upload.wikimedia.org/wikipedia/commons/thumb/2/24/Berlin_U8.svg/22px-Berlin_U8.svg.png" decoding="async" width="22" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/2/24/Berlin_U8.svg/34px-Berlin_U8.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/2/24/Berlin_U8.svg/44px-Berlin_U8.svg.png 2x" data-file-width="436" data-file-height="258"></a></small>
</td></tr>




<tr>
<td style="text-align:center; padding:0; border:none; white-space:nowrap;"><div style="position:relative; z-index:2; background-color:#F9F9F9;" class="bs-icon"><a href="/wiki/Datei:BSicon_uHST.svg" class="image" title="&nbsp;&nbsp;&nbsp;"><img alt="&nbsp;&nbsp;&nbsp;" src="//upload.wikimedia.org/wikipedia/commons/thumb/2/2d/BSicon_uHST.svg/20px-BSicon_uHST.svg.png" decoding="async" width="20" height="20" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/2/2d/BSicon_uHST.svg/30px-BSicon_uHST.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/2/2d/BSicon_uHST.svg/40px-BSicon_uHST.svg.png 2x" data-file-width="500" data-file-height="500"></a></div>
</td>
<td style="text-align:right; vertical-align:middle; padding:0 .5em; font-size:80%; white-space:nowrap; border:none;">5,4
</td>
<td style="padding:0; border:none;" colspan="2"><a href="/wiki/U-Bahnhof_Prinzenstra%C3%9Fe" title="U-Bahnhof Prinzenstraße">Prinzenstraße</a> (Pr) <small><a href="/wiki/U-Bahn-Linie_3_(Berlin)" title="U-Bahn-Linie 3 (Berlin)"><img alt="U3" src="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/22px-Berlin_U3.svg.png" decoding="async" width="22" height="13" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/34px-Berlin_U3.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Berlin_U3.svg/44px-Berlin_U3.svg.png 2x" data-file-width="436" data-file-height="258"></a></small>
</td></tr>




<
</tbody></table>
</td>





