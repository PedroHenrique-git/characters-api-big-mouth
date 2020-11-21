import db from '../database/connection';

class PersonagemController {
  // eslint-disable-next-line class-methods-use-this
  async index(req, res) {
    const trx = await db.transaction();
    const { name } = req.query;

    try {
      const results = {};
      let characters = null;
      const [count] = await trx('personagem').count();
      const limite = 5;

      let { page = 1 } = req.query;
      if (page < 1) page = 1;

      if (name !== undefined) {
        characters = await trx('personagem')
          .select('*')
          .where('name', 'like', `%${name}%`);
      } else {
        characters = await trx('personagem').select('*')
          .limit(limite).offset((page - 1) * limite);
      }

      results.next = `http://localhost:3000/personagem?page=${Number(page) + 1}`;

      if (Number(page) === Math.ceil((count['count(*)']) / limite)) {
        results.next = null;
      }

      if (page > 1) {
        results.prev = `http://localhost:3000/personagem?page=${Number(page) - 1}`;
      }

      await trx.commit();

      return res.status(200).send({
        info: results, characters,
      });
    } catch (e) {
      await trx.rollback();
      return res.status(400).json({ erro: 'Erro ao listar alunos' });
    }
  }

  async create(req, res) {
    const {
      name, age, condition, occupation, image, genre,
    } = req.body;

    const trx = await db.transaction();

    try {
      await trx('personagem').insert({
        name,
        age,
        condition,
        occupation,
        image,
        genre,
      });

      await trx.commit();

      return res.status(200).json({ message: 'Personagem inserido com sucesso' });
    } catch (e) {
      await trx.rollback();

      return res.status(400).json({ erro: e });
    }
  }

  async delete(req, res) {
    const trx = await db.transaction();

    try {
      const { id } = req.params;

      const personagem = await trx('personagem').select('name').where('id', id);

      if (!personagem[0]) {
        return res.status(400).json({ error: 'Envie um id valido' });
      }

      await trx('personagem').where('id', id).del();
      await trx.commit();
      return res.status(200).json({ message: 'Personagem exluido com sucesso' });
    } catch (e) {
      trx.rollback();
      return res.status(400).json({ error: 'Personagem não existe' });
    }
  }

  async update(req, res) {
    const { id } = req.params;

    const {
      name, age, condition, occupation, image, genre,
    } = req.body;

    const trx = await db.transaction();

    try {
      const personagem = await trx('personagem').select('name').where('id', id);

      if (!personagem[0]) {
        return res.status(400).json({ error: 'Envie um id valido' });
      }

      await trx('personagem').where('id', id).update({
        name, age, condition, occupation, image, genre,
      });
      await trx.commit();
      return res.status(200).json({ message: 'Personagem atualizado com sucesso' });
    } catch (e) {
      await trx.rollback();
      return res.status(400).json({ error: 'Personagem não existe' });
    }
  }

  async findOne(req, res) {
    const trx = await db.transaction();
    const { id } = req.params;

    try {
      const personagem = await trx('personagem').select('*').where('id', id);
      return res.status(200).json({ personagem });
    } catch (e) {
      await trx.rollback();
      return res.status(400).json({ error: 'erro ao encontrar personagem' });
    }
  }
}

export default new PersonagemController();
