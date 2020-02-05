import { Op } from 'sequelize';
import { isBefore } from 'date-fns';
import Subscriber from '../models/Subscriber';
import Meetup from '../models/Meetup';
import User from '../models/User';

import SubscriberMail from '../jobs/SubscriberMail';
import Queue from '../../lib/Queue';


class SubscriberController {
  async index(req, res) {
    const user_id = req.userId;

    const meetups = await Subscriber.findAll({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(meetups);
  }


  async store(req, res) {
    const user_id = req.userId;
    const { meetup_id } = req.params;
    const meetup = await Meetup.findByPk(
      meetup_id, {
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
          },
        ],
        attributes: ['id', 'title', 'description', 'location', 'date', 'id_banner'],
      },
    );


    if (meetup.User.id === user_id) {
      return res.status(400).json({ error: 'Cannot subscribe if you is the organizer.' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'This meetup already pass' });
    }

    const isSameDate = await Subscriber.findOne({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (isSameDate) {
      return res.status(400).json({ error: 'You already has a meetup for the same date.' });
    }


    const subscriber = await Subscriber.create({ user_id, meetup_id });

    await Queue.add(SubscriberMail.key, {
      meetup,
    });

    return res.json(subscriber);
  }
}

export default new SubscriberController();
