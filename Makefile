.PHONY: test

clean:
	rm ./bin/library

download:
	go mod download

build: download
	go build -o build/library cmd/library/*.go

run: build
	./build/library

mock:
	rm -rf test/testdata/mocks

	sh ./scripts/mock.sh

test: mock
	go test -test.short ./...

cover: mock
	go test -coverprofile=cover.out -gcflags=-l ./... && go tool cover -html=cover.out && rm cover.out