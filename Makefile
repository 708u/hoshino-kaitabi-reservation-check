PHONY: build
build:
	deno compile -A --importmap=import_map.json -o out/hoshino-kaitabi-reservation src/cmd/main.ts

PHONY: run
run:
	deno run -A --importmap=import_map.json src/cmd/main.ts -v -o out/ --send-notification
