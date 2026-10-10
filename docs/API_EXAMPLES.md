# API examples

## Register

POST `/api/auth/register`

```json
{
  "name": "Princy",
  "email": "princy@example.com",
  "password": "Password@123"
}
```

## Login

POST `/api/auth/login`

```json
{
  "email": "princy@example.com",
  "password": "Password@123"
}
```

## Search

GET:

`/api/properties?city=Chennai&minPrice=3000000&maxPrice=10000000&propertyType=APARTMENT&bedrooms=2&sort=newest&limit=12`

## Create property

POST `/api/properties`

Header:

`Authorization: Bearer ACCESS_TOKEN`

```json
{
  "title": "Premium 2 BHK",
  "description": "Well-connected apartment with modern amenities and parking.",
  "city": "Chennai",
  "location": "Pallikaranai",
  "propertyType": "APARTMENT",
  "price": 6500000,
  "bedrooms": 2,
  "bathrooms": 2,
  "areaSqft": 1100,
  "images": ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"]
}
```

## Inquiry

POST `/api/inquiries/PROPERTY_ID`

Header:

`Authorization: Bearer ACCESS_TOKEN`

```json
{
  "message": "I am interested in this property. Please contact me."
}
```
