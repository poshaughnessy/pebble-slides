var CHUNKS_LENGTH = 512

var Utils = {
	http: function(ip, button, cb, errcb) {
		var req = new XMLHttpRequest()
	  	req.open('GET', 'http://'+ip+':8686/'+button, true)
	  	req.send()
	},
	sendQueue: function (queue) {
        var index = retries = 0

        var doo = function() {
            if (!queue[index]) return

            console.log('sending '+JSON.stringify(queue[index]))
            Pebble.sendAppMessage(queue[index], success, fail)
        }
        var success = function() {
            console.log('Packet sent')
            index += 1
            retries = 0
            doo()
        }
        var fail = function () {
            retries += 1
            if (retries == 3){
                console.log('Packet fails, moving on')
                index += 1
            }
            doo()
        }
        doo()
	},
	send: function(data) {
		console.log(data)
		var chunks = Math.ceil(data.length/CHUNKS_LENGTH),
			queue = []

		console.log(chunks)
                
        for (var i = 0; i < chunks; i++){
            var payload = {note:data.substring(CHUNKS_LENGTH*i, CHUNKS_LENGTH*(i+1))}
            if (i == 0) payload.start = "yes"
            if (i == chunks-1) payload.end = "yes"

            queue.push(payload)
        }

        Utils.sendQueue(queue)
	}
}

var IP = localStorage.getItem('ip') || '192.168.0.2',
	notes = JSON.parse(localStorage.getItem('notes')),
	currentSlide = 0


Pebble.addEventListener("appmessage", function(e) {
	var button = Object.keys(e.payload)[0]
	Utils.http(IP, button)
	if (button == 'up')
		currentSlide--
	else if (button == 'down')
		currentSlide++

	console.log(notes[currentSlide])
	setTimeout(function() {
		Utils.send(notes[currentSlide])
	}, 500)
})

Pebble.addEventListener("showConfiguration", function (e) {
	Pebble.openURL("http://luisivan.net/pebble-slides/")
})

Pebble.addEventListener("webviewclosed", function (e) {
	if (!e.response) return
	var payload = JSON.parse(e.response)
	localStorage.setItem('ip', payload.ip)
	localStorage.setItem('notes', JSON.stringify(payload.notes))
	notes = payload.notes
})