mkdir test/mocks

mkdir test/mocks/article
mkdir test/mocks/author
mkdir test/mocks/book

mockgen -source=internal/article/internal/usecase/usecase.go -destination test/mocks/article/usecase/mock_usecase.go
mockgen -source=internal/article/internal/rest/rest.go -destination test/mocks/article/rest/mock_rest.go

mockgen -source=internal/book/internal/usecase/usecase.go -destination test/mocks/book/usecase/mock_usecase.go
mockgen -source=internal/book/internal/rest/rest.go -destination test/mocks/book/rest/mock_rest.go
