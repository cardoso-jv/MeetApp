import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import User from '../models/User';


class MeetupController {
  async index(req, res) {
    const { page = 1, date } = req.query;
    const where = { };
    if (date) {
      where.date = { [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))] };
    }

    const meetups = await Meetup.findAll({
      where,
      attributes: ['id', 'title', 'description', 'location', 'date', 'id_banner'],
      order: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],

    });
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      id_banner: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Invalid Fields' });
    }

    const id_user = req.userId;

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'You can only create Meetups on future dates.' });
    }
    const meetup = await Meetup.create({ id_user, ...req.body });
    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      id_banner: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Invalid Fields' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'This meetup does not exists.' });
    }
    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'This meetup already past, you can not edit this.' });
    }
    if (meetup.id_user !== req.userId) {
      return res.status(400).json({ error: 'You are not the meeting organizer.' });
    }
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'You cannot change the date to a past date.' });
    }

    await meetup.update(req.body);
    return res.json(meetup);
  }


  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'This meetup does not exists.' });
    }
    if (meetup.id_user !== req.userId) {
      return res.status(400).json({ error: 'You are not the meeting organizer.' });
    }
    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'This meetup already past, you can not delete this.' });
    }

    meetup.destroy();
    return res.json({ message: 'Meetup successfully deleted.' });
  }
}

export default new MeetupController();
