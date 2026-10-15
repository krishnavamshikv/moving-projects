print('🔎 WEBSITE URL CHECKER 🔎')

url = input("\nEnter website URL:")

if url.startswith('https://'):
  print("🔒 Website uses HTTPS (Secure)")
elif url.startswith('http://'):
  print("☠️ Website uses HTTP (Not Secure)")
else:
  print("❌ It dosen't look like proper url")




