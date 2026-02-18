from marshmallow import Schema, fields, validate


class CompanySchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1))
    location = fields.Str(required=False)
    website = fields.Str(required=False)
