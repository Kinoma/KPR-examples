#
#     Copyright (C) 2002-2015 Kinoma, Inc.
#
#     All rights reserved.
#
#     This is a test script for CoAP server.
#
#      ruby test.rb ADDRESS [REPEAT:10] [INTERVAL:1.0]
#
#     Required gem:
# 		coap
#


require 'coap'

client = CoAP::Client.new
host = ARGV[0] || "localhost"
count = (ARGV[1] || 10).to_i
interval = (ARGV[2] || 1).to_f

def r()
	Random.rand(0..255)
end

def random_color()
	[r, r, r]
end

count.to_i.times do |i|
	red, green, blue = random_color

	url = "coap://#{host}/color"
	payload = "red=#{red}&blue=#{blue}&green=#{green}"

	url = url + "?" + payload
	response = client.post_by_uri(url)
	# response = client.post_by_uri(url, payload)

	puts "#{i}: #{response}"

	sleep interval
end
