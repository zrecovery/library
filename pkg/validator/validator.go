// Package validator 用于Echo框架的数据校验.
package validator

// Validate 数据校验.
type Validate interface {
	Struct(s interface{}) error
}

// Validator 数据校验器.
type Validator interface {
	Validate(i interface{}) error
}

// echoValidator 用于Echo框架的数据校验.
type echoValidator struct {
	validator Validate
}

// Validate Echo框架的数据校验函数.
func (ev *echoValidator) Validate(i interface{}) error {
	return ev.validator.Struct(i)
}

// New 新建框架数据校验器.
func New(validate Validate) Validator {
	return &echoValidator{validator: validate}
}
