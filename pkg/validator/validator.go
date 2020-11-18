package validator

type Validate interface {
	Struct(s interface{}) error
}

type Validator interface {
	Validate(i interface{}) error
}

type echoValidator struct {
	validator Validate
}

func (ev *echoValidator) Validate(i interface{}) error {
	return ev.validator.Struct(i)
}

func New(validate Validate) Validator {
	return &echoValidator{validator: validate}
}
