// Package error library自定义错误包
package error

import "errors"

// ErrRowsNumberNotOne 结果数量不为一个.
var ErrRowsNumberNotOne = errors.New("the number of rows affected is not 1")
