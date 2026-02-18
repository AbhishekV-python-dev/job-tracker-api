from marshmallow import Schema, fields, validate


class JobCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1))
    company_id = fields.Int(required=True)


class JobStatusSchema(Schema):
    status = fields.Str(required=True)
