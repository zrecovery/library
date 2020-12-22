mkdir test/mocks

mkdir test/mocks/article
mkdir test/mocks/author
mkdir test/mocks/book

mockgen -source=internal/article/usecase/usecase.go -destination test/mocks/article/usecase/mock_susecase.go
mockgen -source=internal/article/service/service.go -destination test/mocks/article/service/mock_service.go
mockgen -source=internal/author/usecase/usecase.go -destination test/mocks/author/usecase/mock_susecase.go
mockgen -source=internal/author/api/api.go -destination test/mocks/author/api/mock_api.go
mockgen -source=internal/book/usecase/usecase.go -destination test/mocks/book/usecase/mock_susecase.go
mockgen -source=internal/book/service/service.go -destination test/mocks/book/service/mock_service.go
