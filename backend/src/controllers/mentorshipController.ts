import { Request, Response } from 'express';
import { Mentor, MentorBooking, User } from '../models/index';

export const getMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const mentors = await Mentor.findAll({
      where: { isActive: true },
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
      order: [['rating', 'DESC']],
    });
    res.json(mentors);
  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
};

export const getMentorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'fullName', 'email'] },
        {
          model: MentorBooking,
          attributes: ['id', 'sessionType', 'reviewRating', 'reviewComment', 'createdAt'],
          where: { status: 'COMPLETED' },
          required: false,
          include: [{ model: User, attributes: ['id', 'fullName'] }],
        },
      ],
    });

    if (!mentor) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }

    res.json(mentor);
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
};

export const bookSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { mentorId, sessionType, scheduledAt, notes, amount } = req.body;

    const mentor = await Mentor.findByPk(mentorId);
    if (!mentor) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }

    let durationMins = 60;
    if (sessionType === '30_MIN') durationMins = 30;

    const booking = await MentorBooking.create({
      mentorId,
      userId,
      sessionType: sessionType || '60_MIN',
      scheduledAt: new Date(scheduledAt),
      durationMins,
      amount: amount || mentor.hourlyRate,
      status: 'CONFIRMED', // auto confirmed in demo
      meetingLink: 'https://meet.google.com/ska-trd-ment',
      notes: notes || null,
    });

    res.status(201).json(booking);
  } catch (error: any) {
    console.error('Error booking session:', error);
    res.status(500).json({ error: error.message || 'Failed to book session' });
  }
};

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const bookings = await MentorBooking.findAll({
      where: { userId },
      include: [{ model: Mentor, include: [{ model: User, attributes: ['fullName'] }] }],
      order: [['scheduledAt', 'DESC']],
    });
    res.json(bookings);
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getAllBookingsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await MentorBooking.findAll({
      include: [
        { model: Mentor },
        { model: User, attributes: ['id', 'fullName', 'email', 'mobile'] },
      ],
      order: [['scheduledAt', 'DESC']],
    });
    res.json(bookings);
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, meetingLink, notes } = req.body;

    const booking = await MentorBooking.findByPk(id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    await booking.update({
      status: status || booking.status,
      meetingLink: meetingLink !== undefined ? meetingLink : booking.meetingLink,
      notes: notes !== undefined ? notes : booking.notes,
    });

    res.json(booking);
  } catch (error: any) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    const booking = await MentorBooking.findOne({
      where: { id, userId },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    await booking.update({
      reviewRating: rating,
      reviewComment: comment,
    });

    // Update mentor avg rating
    const mentor = await Mentor.findByPk(booking.mentorId);
    if (mentor) {
      await mentor.increment('reviewCount', { by: 1 });
    }

    res.json({ message: 'Review submitted successfully', booking });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const createOrUpdateMentor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId, name, bio, avatarUrl, experienceYears, expertise, tradingStyle, hourlyRate, isActive } = req.body;

    if (id) {
      const mentor = await Mentor.findByPk(id);
      if (!mentor) {
        res.status(404).json({ error: 'Mentor not found' });
        return;
      }
      await mentor.update({
        name,
        bio,
        avatarUrl,
        experienceYears,
        expertise,
        tradingStyle,
        hourlyRate,
        isActive,
      });
      res.json(mentor);
      return;
    }

    const newMentor = await Mentor.create({
      userId: userId || (req as any).user.id,
      name,
      bio,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      experienceYears: experienceYears || 5,
      expertise: expertise || ['Scalping', 'Options'],
      tradingStyle: tradingStyle || 'Intraday Scalper',
      hourlyRate: hourlyRate || 2499.00,
      rating: 5.0,
      reviewCount: 0,
      isActive: true,
    });

    res.status(201).json(newMentor);
  } catch (error: any) {
    console.error('Error creating/updating mentor:', error);
    res.status(500).json({ error: error.message || 'Failed to save mentor' });
  }
};
