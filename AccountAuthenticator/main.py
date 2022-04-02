from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

driver = webdriver.Chrome('./chromedriver.exe')  # Optional argument, if not specified will search path.

accounts = []
length = len(accounts)
n = 1

for account in accounts:
    print("%s:%s (%s/%s)" % (account["username"], account["password"], n, length))
    driver.get("https://www.reddit.com/login/")
    driver.find_element_by_id('loginUsername').send_keys(account["username"])
    driver.find_element_by_id('loginPassword').send_keys(account["password"])
    driver.find_element_by_xpath('/html/body/div/main/div[1]/div/div[2]/form/fieldset[5]/button').click()
    time.sleep(5)

    driver.get("https://reddit-placer.herokuapp.com/auth/")
    driver.find_element_by_xpath('/html/body/div[3]/div/div[2]/form/div/input[1]').click()
    time.sleep(10)
    n = n + 1