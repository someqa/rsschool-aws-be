#!/bin/bash
echo "Seeding started..."

productsData=(
  '{ "id": {"S": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}, "title": {"S": "Shelly T-shirt"}, "description": {"S": "T-shirt featuring Shelly from Brawl Stars."}, "price": {"N": "15.47"} }'
  '{ "id": {"S": "1b671a64-40d5-491e-99b0-da01ff1f3341"}, "title": {"S": "Colt T-shirt"}, "description": {"S": "T-shirt featuring Colt from Brawl Stars."}, "price": {"N": "12.99"} }'
  '{ "id": {"S": "98b71e9e-5c99-46d7-b1ac-4cf448f88007"}, "title": {"S": "El Primo T-shirt"}, "description": {"S": "T-shirt featuring El Primo from Brawl Stars."}, "price": {"N": "18.75"} }'
  '{ "id": {"S": "57c8b446-03b4-4f09-bf60-2b3eacec3d38"}, "title": {"S": "Poco T-shirt"}, "description": {"S": "T-shirt featuring Poco from Brawl Stars."}, "price": {"N": "20.50"} }'
  '{ "id": {"S": "4b8e58da-ba0c-4a87-9ef0-22a0b51f141a"}, "title": {"S": "Rico T-shirt"}, "description": {"S": "T-shirt featuring Rico from Brawl Stars."}, "price": {"N": "17.25"} }'
  '{ "id": {"S": "d5b1a98a-c94e-4e58-9d35-8a97503f8738"}, "title": {"S": "Bull T-shirt"}, "description": {"S": "T-shirt featuring Bull from Brawl Stars."}, "price": {"N": "19.99"} }'
  '{ "id": {"S": "2e00f7a6-364f-4c3b-b71f-d8f27c4c4c09"}, "title": {"S": "Jessie T-shirt"}, "description": {"S": "T-shirt featuring Jessie from Brawl Stars."}, "price": {"N": "14.75"} }'
  '{ "id": {"S": "cc170d91-8728-432d-8eab-384b1d7d98b8"}, "title": {"S": "Dynamike T-shirt"}, "description": {"S": "T-shirt featuring Dynamike from Brawl Stars."}, "price": {"N": "16.80"} }'
  '{ "id": {"S": "9a8d1c2d-0560-4b2e-a60c-4486a900cb53"}, "title": {"S": "Mortis T-shirt"}, "description": {"S": "T-shirt featuring Mortis from Brawl Stars."}, "price": {"N": "13.49"} }'
  '{ "id": {"S": "ba16e9d1-9ed8-4da1-80d4-d54c0b51b4f4"}, "title": {"S": "Leon T-shirt"}, "description": {"S": "T-shirt featuring Leon from Brawl Stars."}, "price": {"N": "15.95"} }'
)

stocksData=(
  '{ "product_id": {"S": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}, "count": {"N": "100"} }'
  '{ "product_id": {"S": "1b671a64-40d5-491e-99b0-da01ff1f3341"}, "count": {"N": "50"} }'
  '{ "product_id": {"S": "98b71e9e-5c99-46d7-b1ac-4cf448f88007"}, "count": {"N": "75"} }'
  '{ "product_id": {"S": "57c8b446-03b4-4f09-bf60-2b3eacec3d38"}, "count": {"N": "80"} }'
  '{ "product_id": {"S": "4b8e58da-ba0c-4a87-9ef0-22a0b51f141a"}, "count": {"N": "120"} }'
  '{ "product_id": {"S": "d5b1a98a-c94e-4e58-9d35-8a97503f8738"}, "count": {"N": "90"} }'
  '{ "product_id": {"S": "2e00f7a6-364f-4c3b-b71f-d8f27c4c4c09"}, "count": {"N": "60"} }'
  '{ "product_id": {"S": "cc170d91-8728-432d-8eab-384b1d7d98b8"}, "count": {"N": "110"} }'
  '{ "product_id": {"S": "9a8d1c2d-0560-4b2e-a60c-4486a900cb53"}, "count": {"N": "70"} }'
  '{ "product_id": {"S": "ba16e9d1-9ed8-4da1-80d4-d54c0b51b4f4"}, "count": {"N": "95"} }'
)

echo "Seeding products table..."

for product in "${productsData[@]}"; do
  aws dynamodb put-item --table-name products --item "$product"
done

echo "Seeding stocks table..."

for stock in "${stocksData[@]}"; do
  aws dynamodb put-item --table-name stocks --item "$stock"
done

echo "Seeding complete."
