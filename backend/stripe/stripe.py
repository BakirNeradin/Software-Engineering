import os

from stripe import StripeClient
from dotenv import load_dotenv

load_dotenv()

client = StripeClient(os.getenv("STRIPE_SECRET_KEY"))

# list customers
customers = client.v1.customers.list()

# print the first customer's email
print(customers.data[0].email)

# retrieve specific Customer
customer = client.v1.customers.retrieve("cus_123456789")

# print that customer's email
print(customer.email)