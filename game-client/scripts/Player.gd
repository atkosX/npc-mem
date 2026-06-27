extends CharacterBody2D
## Top-down player. Arrow keys move; Space/Enter talks to the nearest NPC.

@export var speed: float = 220.0
@export var interact_radius: float = 110.0

func _physics_process(_delta: float) -> void:
	if DialogueUI.is_open():
		velocity = Vector2.ZERO
		return
	var dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	velocity = dir * speed
	move_and_slide()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept") and not DialogueUI.is_open():
		var npc := _nearest_npc()
		if npc != null:
			DialogueUI.open(npc.npc_id, npc.npc_name)
			get_viewport().set_input_as_handled()

func _nearest_npc() -> Node2D:
	var best: Node2D = null
	var best_d := interact_radius
	for npc in get_tree().get_nodes_in_group("npcs"):
		var d := global_position.distance_to((npc as Node2D).global_position)
		if d <= best_d:
			best_d = d
			best = npc
	return best
