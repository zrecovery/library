// Package validator 数据校验.
package validator

// Validate 数据校验.
type Validate interface {
	Struct(s interface{}) error
}

// Validator 数据校验器.
type Validator interface {
	Validate(i interface{}) error
}

type echoValidator struct {
	validator Validate
}

// Validate 数据校验.
func (ev *echoValidator) Validate(i interface{}) error {
	return ev.validator.Struct(i)
}

// New 新建校验器.
func New(validate Validate) Validator {
	return &echoValidator{validator: validate}
}
