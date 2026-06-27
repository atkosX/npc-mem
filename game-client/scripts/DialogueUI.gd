extends CanvasLayer
## Autoloaded dialogue box. Builds its whole UI in code so the scene file stays
## tiny. open(npc_id, name) shows it; the player's typed line is POSTed to the
## backend via GameApi and the NPC's reply is displayed.

var _name_label: Label
var _npc_text: RichTextLabel
var _input: LineEdit
var _status: Label
var _npc_id := ""
var _open := false

func _ready() -> void:
	layer = 100
	visible = false
	_build()

func _build() -> void:
	var panel := Panel.new()
	panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel.offset_left = 20
	panel.offset_right = -20
	panel.offset_top = -250
	panel.offset_bottom = -20
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.offset_left = 16
	vbox.offset_top = 12
	vbox.offset_right = -16
	vbox.offset_bottom = -12
	vbox.add_theme_constant_override("separation", 8)
	panel.add_child(vbox)

	_name_label = Label.new()
	_name_label.add_theme_font_size_override("font_size", 22)
	vbox.add_child(_name_label)

	_npc_text = RichTextLabel.new()
	_npc_text.bbcode_enabled = true
	_npc_text.fit_content = true
	_npc_text.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_npc_text.custom_minimum_size = Vector2(0, 90)
	vbox.add_child(_npc_text)

	var row := HBoxContainer.new()
	vbox.add_child(row)

	_input = LineEdit.new()
	_input.placeholder_text = "Say something, then press Enter..."
	_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_input.text_submitted.connect(_on_submit)
	row.add_child(_input)

	var send := Button.new()
	send.text = "Send"
	send.pressed.connect(func() -> void: _on_submit(_input.text))
	row.add_child(send)

	_status = Label.new()
	_status.modulate = Color(1, 1, 1, 0.55)
	vbox.add_child(_status)

func is_open() -> bool:
	return _open

func open(npc_id: String, npc_name: String) -> void:
	_npc_id = npc_id
	_name_label.text = npc_name
	_npc_text.text = "[i](type a line and press Enter — walk away or press Esc to leave)[/i]"
	_status.text = ""
	_input.text = ""
	_input.editable = true
	visible = true
	_open = true
	_input.grab_focus()

func close() -> void:
	visible = false
	_open = false
	_npc_id = ""

func _unhandled_input(event: InputEvent) -> void:
	if _open and event.is_action_pressed("ui_cancel"):
		close()
		get_viewport().set_input_as_handled()

func _on_submit(text: String) -> void:
	text = text.strip_edges()
	if text == "" or _npc_id == "":
		return
	_input.editable = false
	_status.text = "..."
	var res: Dictionary = await GameApi.dialogue_respond(_npc_id, text)
	_input.editable = true
	_input.text = ""
	_input.grab_focus()
	if res.has("error"):
		_npc_text.text = "[color=#ff6666]Error:[/color] " + str(res["error"])
		_status.text = "Is the backend running on :8000?"
	else:
		_npc_text.text = str(res.get("npc_line", "(no line)"))
		_status.text = "memories used: %s   ·   %s" % [
			str(res.get("memories_used", "?")), str(res.get("model", ""))]
