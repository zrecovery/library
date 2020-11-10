mockgen -source=pkg/article/usecase/usecase.go -destination test/mocks/article/usecase/mock_susecase.go
mockgen -source=pkg/article/service/service.go -destination test/mocks/article/service/mock_service.go
mockgen -source=pkg/author/usecase/usecase.go -destination test/mocks/article/usecase/mock_susecase.go
mockgen -source=pkg/author/service/service.go -destination test/mocks/author/service/mock_service.go
