import porthole
from random import *

# generate random boxes
boxPos = []
boxRot = []
boxScale = []
boxColor = []

numBoxes = 10
for i in range(1, numBoxes):
    boxPos.extend([
        -1 + random(), 
        1.5 + random(), 
        -2 + random()])
    boxScale.extend([
        1 + random() * 0.5,
        1 + random() * 0.5,
        1 + random() * 0.5])
    boxRot.extend([
        0,
        0,
        0])
    boxColor.extend([
        Color(random(),random(),random(),1).toString()[:-2]])

# Setup porthole
porthole.initialize(4080, 'synced_draggablecubes.html')
p = porthole.getService()

p.setConnectedCommand("onClientConnected('%id%')")

def onClientConnected(id):
    js = 'makeBoxes({0}, {1}, {2}, {3}, {4})'.format(numBoxes, boxPos, boxRot, boxScale, boxColor)
    p.sendjs(js, id)

# Called from clients when one box moves.
def onBoxMoved(client, boxid, x, y, z):
    boxPos[boxid * 3] = x
    boxPos[boxid * 3 + 1] = y
    boxPos[boxid * 3 + 2] = z
    js = 'setBoxPosition({0}, {1})'.format(boxid, [x, y, z])
    p.broadcastjs(js, client)
    
# If we have a display, run a webView on it.
if(not isHeadless()):
    from webView import *
    TileWebCore.instance().loadUrl('http://localhost:4080')	
    