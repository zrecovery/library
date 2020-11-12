.PHONY: test

clean:
	rm -rf tmp
	mkdir tmp
	rm ./bin/library

bin/library: build

build:
	go build -o bin/library cmd/library/*.go

run: build
	./bin/library

mock:
	rm -rf test/mocks

	mkdir -p test/mocks/article
	mockgen -source=pkg/article/usecase/usecase.go -destination test/mocks/article/usecase/mock_susecase.go
	mockgen -source=pkg/article/service/service.go -destination test/mocks/article/service/mock_service.go

test: mock
	go test ./pkg/...

cover:
	go test -coverprofile=cover.out -gcflags=-l ./pkg/... && go tool cover -html=cover.out && rm cover.out