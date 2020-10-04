const { createWorker, createScheduler } = require("tesseract.js");

const scheduler = createScheduler();
const worker1 = createWorker();
const worker2 = createWorker();

(async () => {
  await worker1.load();
  await worker2.load();
  await worker1.loadLanguage("eng");
  await worker2.loadLanguage("eng");
  await worker1.initialize("eng");
  await worker2.initialize("eng");
  scheduler.addWorker(worker1);
  scheduler.addWorker(worker2);
  /** Add 10 recognition jobs */
  const results = await Promise.all(
    Array(10)
      .fill(0)
      .map(() => scheduler.addJob("recognize", "ocrimg.png"))
  );
  console.log(results);
  await scheduler.terminate(); // It also terminates all workers.
})();

/* const worker = createWorker({
  logger: (m) => console.log(m),
});

(async () => {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize("./ocrimg.png");
  console.log(text);
  await worker.terminate();
})();
 */
/* Tesseract.recognize(
  "https://tesseract.projectnaptha.com/img/eng_bw.png",
  "eng",
  { logger: (m) => console.log(m) }
).then(({ data: { text } }) => {
  console.log(text);
});
 */
