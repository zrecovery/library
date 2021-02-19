mkdir test/testdata/mocks

mkdir test/testdata/mocks/article
mkdir test/testdata/mocks/book

mockgen -source=internal/article/internal/usecase/usecase.go -destination test/testdata/mocks/article/usecase/mock_usecase.go
mockgen -source=internal/article/internal/rest/rest.go -destination test/testdata/mocks/article/rest/mock_rest.go

mockgen -source=internal/book/internal/usecase/usecase.go -destination test/testdata/mocks/book/usecase/mock_usecase.go
mockgen -source=internal/book/internal/rest/rest.go -destination test/testdata/mocks/book/rest/mock_rest.go
