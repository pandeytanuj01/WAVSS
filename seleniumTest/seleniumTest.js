var webdriver = require("selenium-webdriver");
var By = webdriver.By;
require('chromedriver');

async function regisloginnout() {
  var driver = new webdriver.Builder().forBrowser("chrome").build();
  driver.manage().window().maximize();

  await driver.get("http://localhost:4000/auth/register");

  var loginName = driver.findElement({ xpath: '//input[@name="name"]' });
  await loginName.sendKeys("Tarmuj");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var loginId = driver.findElement({ xpath: '//input[@name="email"]' });
  await loginId.sendKeys("whytarmujmail@gmail.com");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var loginUname = driver.findElement({ xpath: '//input[@name="username"]' });
  await loginUname.sendKeys("hamdey");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var passwd = driver.findElement(By.xpath("//input[@name='password']"));

  await passwd.sendKeys("admin123");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var conpasswd = driver.findElement(
    By.xpath("//input[@name='confirmpassword']")
  );

  await conpasswd.sendKeys("admin123");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var submit = driver.findElement(By.xpath("//div[@class='mb-3']//button"));
  await submit.click();

  await driver.getTitle().then(function (title) {
    console.log(title);
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var loginId = driver.findElement({ xpath: '//input[@name="email"]' });
  await loginId.sendKeys("dastitas21@gmail.com");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var passwd = driver.findElement(By.xpath("//input[@name='password']"));

  await passwd.sendKeys("admin123");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  var submit = driver.findElement(By.xpath("//div[@class='mb-4']//button"));
  await submit.click();

  await driver.getTitle().then(function (title) {
    console.log(title);
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  var submit2 = driver.findElement(
    By.xpath("//li[@class='log_out']//span[@class='links_name']")
  );
  await submit2.click();

  await new Promise((resolve) => setTimeout(resolve, 5000));

  driver.quit();
}

regisloginnout();
