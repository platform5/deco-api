[Home Documentation](./index.md)

# Validation decorators

## @validate.required

Will prevent saving if the property is empty, null or undefined.

## @validate.minLength(minLength: number = 0)

Will prevent saving if the property has a length smaller than `minLength`.

## @validate.maxLength(maxLength: number = 0)

Will prevent saving if the property has a length longer than `maxLength`.

## @validate.email

Only accept valid email addresses. This is only a regex check.

## @validate.slug

Only accept strings that can be used as slugs.

Regexp for slug: `/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/`