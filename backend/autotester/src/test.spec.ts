const request = require("supertest");

describe("Task 1", () => {
  describe("POST /parse", () => {
    const getTask1 = async (inputStr) => {
      return await request("http://localhost:8080")
        .post("/parse")
        .send({ input: inputStr });
    };

    it("example1", async () => {
      const response = await getTask1("Riz@z RISO00tto!");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });

    it("example2", async () => {
      const response = await getTask1("alpHa-alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("error case", async () => {
      const response = await getTask1("");
      expect(response.status).toBe(400);
    });

    it("custom1", async () => {
      const response = await getTask1("meatball");
      expect(response.body).toStrictEqual({ msg: "Meatball" });
    });

    it("custom2", async () => {
      const response = await getTask1("Skibidi spaghetti");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("custom3", async () => {
      const response = await getTask1("alpHa alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("custom4", async () => {
      const response = await getTask1("Skibidi   spaghetti");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("custom5", async () => {
      const response = await getTask1("Skibidi spaghetti    ");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("custom6", async () => {
      const response = await getTask1("Skibidi___Spaghetti  ");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("custom7", async () => {
      const response = await getTask1(" __ Skibidi Spaghetti");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("custom8", async () => {
      const response = await getTask1(" __ Sk1!109#21ib-idi Spa09()gHe_-_00___tT[{}i");
      expect(response.body).toStrictEqual({ msg: "Skib Idi Spaghe Tti" });
    });
  });
});

describe("Task 2", () => {
  describe("POST /entry", () => {
    const putTask2 = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    it("Add Ingredients", async () => {
      const entries = [
        { type: "ingredient", name: "Egg", cookTime: 6 },
        { type: "ingredient", name: "Lettuce", cookTime: 1 },
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(200);
        expect(resp.body).toStrictEqual({});
      }
    });

    it("Add Recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [{ name: "Beef", quantity: 1 }],
      };
      const resp1 = await putTask2(meatball);
      expect(resp1.status).toBe(200);
    });

    it("Congratulations u burnt the pan pt2", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "beef",
        cookTime: -1,
      });
      expect(resp.status).toBe(400);
    });

    it("Congratulations u burnt the pan pt3", async () => {
      const resp = await putTask2({
        type: "pan",
        name: "pan",
        cookTime: 20,
      });
      expect(resp.status).toBe(400);
    });

    it("Unique names", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 10,
      });
      expect(resp.status).toBe(200);

      const resp2 = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp2.status).toBe(400);

      const resp3 = await putTask2({
        type: "recipe",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp3.status).toBe(400);
    });

    it("custom1", async () => {
      const resp = await putTask2({
        type: "recipe",
        name: "Skibidi Spaghetti",
        requiredItems: [{name: "Meatball", quantity: 3}, {name: "Pasta", quantity: 1}, {name: "Tomato", quantity: 2}]
      });
      expect(resp.status).toBe(200);

      const resp2 = await putTask2({
        type: "recipe",
        name: "Pasta",
        requiredItems: [{name: "Flour", quantity: 3}, {name: "Egg", quantity: 1}]
      });
      expect(resp2.status).toBe(200);
    });
  });
});

describe("Task 3", () => {
  describe("GET /summary", () => {
    const postEntry = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    const getTask3 = async (name) => {
      return await request("http://localhost:8080").get(
        `/summary?name=${name}`
      );
    };

    it("What is bro doing - Get empty cookbook", async () => {
      const resp = await getTask3("nothing");
      expect(resp.status).toBe(400);
    });

    it("What is bro doing - Get ingredient", async () => {
      const resp = await postEntry({
        type: "ingredient",
        name: "beef",
        cookTime: 2,
      });
      expect(resp.status).toBe(200);

      const resp2 = await getTask3("beef");
      expect(resp2.status).toBe(400);
    });

    it("Unknown missing item", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Cheese");
      expect(resp2.status).toBe(400);
    });

    it("Bro cooked", async () => {
      const meatball = {
        type: "recipe",
        name: "Skibidi",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "ingredient",
        name: "Bruh",
        cookTime: 2,
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Skibidi");
      expect(resp3.status).toBe(200);
    });

    it("custom1", async () => {
      const spaghetti = {
        type: "recipe",
        name: "Spaghetti",
        requiredItems: [{name: "Meatball", quantity: 3}, {name: "Pasta", quantity: 1}, {name: "Tomato", quantity: 2}]
      };
      const resp = await postEntry(spaghetti);
      expect(resp.status).toBe(200);

      const flour = {
        "type": "ingredient",
        "name": "Flour",
        "cookTime": 0
      };
      const resp2 = await postEntry(flour);
      expect(resp2.status).toBe(200);

      const tomato = {
        "type": "ingredient",
        "name": "Tomato",
        "cookTime": 2,
      };
      const resp3 = await postEntry(tomato);
      expect(resp3.status).toBe(200);

      const resp4 = await getTask3("Spaghetti");
      expect(resp4.status).toBe(200);
    });
  });
});
