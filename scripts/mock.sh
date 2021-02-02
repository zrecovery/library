mkdir test/mocks

mkdir test/mocks/article
mkdir test/mocks/author
mkdir test/mocks/book

mockgen -source=internal/article/internal/usecase/usecase.go -destination test/mocks/article/usecase/mock_usecase.go
mockgen -source=internal/article/internal/api/api.go -destination test/mocks/article/api/mock_api.go

mockgen -source=internal/book/internal/usecase/usecase.go -destination test/mocks/book/usecase/mock_usecase.go
mockgen -source=internal/book/internal/api/api.go -destination test/mocks/book/api/mock_api.go
