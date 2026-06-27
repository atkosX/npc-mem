extends Node
## Autoloaded HTTP client for the Neighbourhood Echoes backend.
## Start the backend first:  uvicorn api:app --port 8000

const BASE_URL := "http://127.0.0.1:8000"

var _http: HTTPRequest

func _ready() -> void:
	_http = HTTPRequest.new()
	add_child(_http)

## POST /dialogue/respond — returns the parsed JSON Dictionary,
## or {"error": "..."} on any failure.
func dialogue_respond(npc_id: String, player_input: String) -> Dictionary:
	var url := BASE_URL + "/dialogue/respond"
	var headers := PackedStringArray(["Content-Type: application/json"])
	var payload := JSON.stringify({"npc_id": npc_id, "player_input": player_input})
	var err := _http.request(url, headers, HTTPClient.METHOD_POST, payload)
	if err != OK:
		return {"error": "could not start request (%d)" % err}

	var result: Array = await _http.request_completed
	# result = [result_code, response_code, headers, body]
	var response_code: int = result[1]
	var body_text: String = (result[3] as PackedByteArray).get_string_from_utf8()

	if response_code != 200:
		return {"error": "HTTP %d: %s" % [response_code, body_text]}
	var parsed: Variant = JSON.parse_string(body_text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return {"error": "bad response: " + body_text}
	return parsed
