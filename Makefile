.PHONY: test

clean:
	rm ./bin/library

download:
	go mod download

build: download
	go build -o bin/library cmd/library/*.go

run: build
	./bin/library

mock:
	rm -rf test/mocks

	sh ./scripts/mock.sh

test: mock
	go test ./...

cover: mock
	go test -coverprofile=cover.out -gcflags=-l ./... && go tool cover -html=cover.out && rm cover.out